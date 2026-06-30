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
  skills?: string[]
}

// New interfaces for database tables
export interface LearningSession {
  id: string
  userId: string
  title: string
  userInput: string
  status: 'in_progress' | 'completed' | 'gave_up'
  bookmarked: boolean
  completedAt: string | null
  createdAt: string
}

export interface Attempt {
  id: string
  sandboxId: string
  submittedCode: string
  feedback: object
  score: number
  attemptNumber: number | null
  isCorrect: boolean
  createdAt: string
}

export interface Sandbox {
  id: string
  sessionId: string
  isSolved: boolean
  solutionViewed: boolean
  createdAt: string
}