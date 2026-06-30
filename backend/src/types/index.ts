export interface SyntaxBreakdownItem {
  syntax: string
  explanation: string
}

export interface SandboxResponse {
  title: string
  language: string
  concept: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  conceptOverview: string
  realWorldAnalogy: string
  requestFlow: string
  syntaxBreakdown: SyntaxBreakdownItem[]
  brokenCode: string
  task: string
  hints: string[]
  solutionCode: string
  quizQuestion: string
  quizOptions: string[]
  quizCorrectIndex: number
  skills: string[]
}

// Database table types
export interface LearningSession {
  id: string
  user_id: string
  title: string
  user_input: string
  status: 'in_progress' | 'completed' | 'gave_up'
  bookmarked: boolean
  completed_at: string | null
  created_at: string
}

export interface Attempt {
  id: string
  sandbox_id: string
  submitted_code: string
  feedback: object
  score: number
  attempt_number: number | null
  is_correct: boolean
  created_at: string
}

export interface DbSandbox {
  id: string
  session_id: string
  is_solved: boolean
  solution_viewed: boolean
  created_at: string
}