import { supabase } from '../../config/db'

interface SandboxPayload {
  concept: string
  difficulty: string
  estimatedMinutes: number
  skills: string[]
  language: string
  brokenCode: string
  solutionCode: string
  task: string
  hints: string[]
  conceptOverview: string
  realWorldAnalogy: string
  requestFlow: string
  syntaxBreakdown: unknown
  quizQuestion: string
  quizOptions: string[]
  quizCorrectIndex: number
}

// sandboxes(concept, language) embeds as an array or a single object depending on the
// PostgREST relationship Supabase infers; this normalizes either shape to one row.
function firstSandbox<T>(row: { sandboxes: T | T[] | null }): T | null {
  if (Array.isArray(row.sandboxes)) return row.sandboxes[0] ?? null
  return row.sandboxes ?? null
}

export const createSession = async (dbUserId: string, title: string, userInput: string, sandbox: SandboxPayload) => {
  const { data: session, error: sessionError } = await supabase
    .from('learning_sessions')
    .insert({ user_id: dbUserId, title, user_input: userInput })
    .select()
    .single()

  if (sessionError) throw sessionError

  const { data: sandboxRow, error: sandboxError } = await supabase
    .from('sandboxes')
    .insert({
      session_id: session.id,
      intent: userInput,
      topic: sandbox.concept,
      concept: sandbox.concept,
      difficulty: sandbox.difficulty,
      estimated_minutes: sandbox.estimatedMinutes,
      skills: sandbox.skills,
      language: sandbox.language,
      broken_code: sandbox.brokenCode,
      current_code: sandbox.brokenCode,
      solution_code: sandbox.solutionCode,
      task: sandbox.task,
      hints: sandbox.hints,
      explanation: sandbox.conceptOverview,
      quiz_question: sandbox.quizQuestion,
      quiz_options: sandbox.quizOptions,
      quiz_correct_index: sandbox.quizCorrectIndex,
      is_solved: false,
      extra_data: {
        realWorldAnalogy: sandbox.realWorldAnalogy,
        requestFlow: sandbox.requestFlow,
        syntaxBreakdown: sandbox.syntaxBreakdown
      }
    })
    .select()
    .single()

  if (sandboxError) throw sandboxError

  return { session, sandbox: sandboxRow }
}

export const listSessions = async (dbUserId: string) => {
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*, sandboxes(concept, language, is_solved)')
    .eq('user_id', dbUserId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const sandbox = firstSandbox<{ concept: string; language: string; is_solved: boolean }>(row)
    return { ...row, sandboxes: undefined, concept: sandbox?.concept ?? null, language: sandbox?.language ?? null, is_solved: sandbox?.is_solved ?? false }
  })
}

export const getSessionDetail = async (sessionId: string, dbUserId: string) => {
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('*, sandboxes(*)')
    .eq('id', sessionId)
    .eq('user_id', dbUserId)
    .single()

  if (error) throw error

  const sandbox = firstSandbox<Record<string, any>>(data)
  if (!sandbox) throw new Error('Session has no sandbox')

  return { session: data, sandbox }
}

export const updateSessionMeta = async (
  sessionId: string,
  dbUserId: string,
  updates: { title?: string; status?: string; bookmarked?: boolean }
) => {
  const payload: Record<string, unknown> = {}
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.bookmarked !== undefined) payload.bookmarked = updates.bookmarked

  const { data, error } = await supabase
    .from('learning_sessions')
    .update(payload)
    .eq('id', sessionId)
    .eq('user_id', dbUserId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSession = async (sessionId: string, dbUserId: string) => {
  const { data: sandboxRow } = await supabase
    .from('sandboxes')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (sandboxRow) {
    await supabase.from('attempts').delete().eq('sandbox_id', sandboxRow.id)
    await supabase.from('sandboxes').delete().eq('id', sandboxRow.id)
  }

  const { error } = await supabase
    .from('learning_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', dbUserId)

  if (error) throw error
}

export const updateSandbox = async (
  sessionId: string,
  updates: {
    quizQuestion?: string
    quizOptions?: string[]
    quizCorrectIndex?: number
    isSolved?: boolean
    currentCode?: string
    progress?: number
  }
) => {
  const payload: Record<string, unknown> = {}
  if (updates.quizQuestion !== undefined) payload.quiz_question = updates.quizQuestion
  if (updates.quizOptions !== undefined) payload.quiz_options = updates.quizOptions
  if (updates.quizCorrectIndex !== undefined) payload.quiz_correct_index = updates.quizCorrectIndex
  if (updates.isSolved !== undefined) payload.is_solved = updates.isSolved
  if (updates.currentCode !== undefined) payload.current_code = updates.currentCode
  if (updates.progress !== undefined) payload.progress = updates.progress

  const { data, error } = await supabase
    .from('sandboxes')
    .update(payload)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const recordAttempt = async (sessionId: string, submittedCode: string, isCorrect: boolean) => {
  const { data: sandboxRow, error: findError } = await supabase
    .from('sandboxes')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (findError) throw findError

  const { error } = await supabase.from('attempts').insert({
    sandbox_id: sandboxRow.id,
    submitted_code: submittedCode,
    feedback: { isCorrect },
    score: isCorrect ? 100 : 0
  })

  if (error) throw error
}

// ponytail: "top topics" buckets by the concept field rather than a curated category
// taxonomy — good enough until product wants real category mapping.
export const getProfileStats = async (dbUserId: string, authId: string) => {
  const { data: authUser } = await supabase.auth.admin.getUserById(authId)
  const { data: profile } = await supabase.from('users').select('username').eq('id', dbUserId).maybeSingle()

  const { data: sessions, error } = await supabase
    .from('learning_sessions')
    .select('id, title, status, created_at, sandboxes(concept, language, progress)')
    .eq('user_id', dbUserId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (sessions ?? []).map((row) => ({
    ...row,
    sandbox: firstSandbox<{ concept: string; language: string; progress: number }>(row)
  }))

  const totalSessions = rows.length
  const conceptsLearned = new Set(
    rows.filter((r) => r.sandbox?.progress === 100 && r.sandbox?.concept).map((r) => r.sandbox!.concept)
  ).size

  // progress (25/50/75/100) tracks how far each individual session got;
  // a topic's bar shows the average completion across its sessions.
  const topicProgress = new Map<string, { count: number; totalProgress: number }>()
  for (const r of rows) {
    const concept = r.sandbox?.concept
    if (!concept) continue
    const entry = topicProgress.get(concept) ?? { count: 0, totalProgress: 0 }
    entry.count += 1
    entry.totalProgress += r.sandbox?.progress ?? 25
    topicProgress.set(concept, entry)
  }
  const topTopics = [...topicProgress.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, { count, totalProgress }]) => ({ name, count, avgProgress: Math.round(totalProgress / count) }))

  const sessionDates = new Set(rows.map((r) => new Date(r.created_at).toDateString()))
  let streakDays = 0
  const cursor = new Date()
  while (sessionDates.has(cursor.toDateString())) {
    streakDays++
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    username: profile?.username ?? null,
    email: authUser?.user?.email ?? null,
    memberSince: authUser?.user?.created_at ?? null,
    totalSessions,
    conceptsLearned,
    streakDays,
    topTopics,
    recentSessions: rows.slice(0, 6).map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      language: r.sandbox?.language ?? null
    }))
  }
}
