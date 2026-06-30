import type { SandboxResponse } from '../types'
import { apiClient } from './api'

export interface SessionRow {
  id: string
  user_id: string
  title: string
  user_input: string
  status: 'in_progress' | 'completed' | 'gave_up'
  bookmarked: boolean
  created_at: string
  concept: string | null
  language: string | null
  is_solved: boolean
}

export interface SandboxRow {
  id: string
  session_id: string
  concept: string
  difficulty: string
  estimated_minutes: number
  skills: string[]
  language: string
  broken_code: string
  current_code: string | null
  solution_code: string
  task: string
  hints: string[]
  explanation: string
  quiz_question: string
  quiz_options: string[]
  quiz_correct_index: number
  is_solved: boolean
  progress: number
  extra_data: { realWorldAnalogy: string; requestFlow: string; syntaxBreakdown: unknown } | null
}

export interface ProfileStats {
  username: string | null
  email: string | null
  memberSince: string | null
  totalSessions: number
  conceptsLearned: number
  streakDays: number
  topTopics: { name: string; count: number; avgProgress: number }[]
  recentSessions: { id: string; title: string; created_at: string; language: string | null }[]
}

export const createSession = async (
  title: string,
  userInput: string,
  sandbox: SandboxResponse
): Promise<{ session: SessionRow; sandbox: SandboxRow }> => {
  const response = await apiClient.post('/api/sessions', { title, userInput, sandbox })
  return response.data
}

export const listSessions = async (): Promise<SessionRow[]> => {
  const response = await apiClient.get('/api/sessions')
  return response.data.sessions
}

export const getSessionDetail = async (id: string): Promise<{ session: SessionRow; sandbox: SandboxRow }> => {
  const response = await apiClient.get(`/api/sessions/${id}`)
  return response.data
}

export const updateSession = async (
  id: string,
  updates: { title?: string; status?: SessionRow['status']; bookmarked?: boolean }
): Promise<SessionRow> => {
  const response = await apiClient.patch(`/api/sessions/${id}`, updates)
  return response.data.session
}

export const deleteSession = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/sessions/${id}`)
}

export const updateSandbox = async (
  sessionId: string,
  updates: { quizQuestion?: string; quizOptions?: string[]; quizCorrectIndex?: number; isSolved?: boolean; currentCode?: string; progress?: number }
): Promise<SandboxRow> => {
  const response = await apiClient.patch(`/api/sessions/${sessionId}/sandbox`, updates)
  return response.data.sandbox
}

export const submitAttempt = async (sessionId: string, submittedCode: string, isCorrect: boolean) => {
  await apiClient.post(`/api/sessions/${sessionId}/attempts`, { submittedCode, isCorrect })
}

export const getProfileStats = async (): Promise<ProfileStats> => {
  const response = await apiClient.get('/api/sessions/stats')
  return response.data
}

export function sandboxRowToResponse(sandbox: SandboxRow, title: string): SandboxResponse {
  return {
    title,
    language: sandbox.language,
    concept: sandbox.concept,
    difficulty: sandbox.difficulty as SandboxResponse['difficulty'],
    estimatedMinutes: sandbox.estimated_minutes,
    conceptOverview: sandbox.explanation,
    realWorldAnalogy: sandbox.extra_data?.realWorldAnalogy ?? '',
    requestFlow: sandbox.extra_data?.requestFlow ?? '',
    syntaxBreakdown: (sandbox.extra_data?.syntaxBreakdown as SandboxResponse['syntaxBreakdown']) ?? [],
    brokenCode: sandbox.broken_code,
    task: sandbox.task,
    hints: sandbox.hints,
    solutionCode: sandbox.solution_code,
    quizQuestion: sandbox.quiz_question,
    quizOptions: sandbox.quiz_options,
    quizCorrectIndex: sandbox.quiz_correct_index,
    skills: sandbox.skills
  }
}
