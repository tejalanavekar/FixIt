export interface User {
  id: string
  authId: string
  username: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

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
}