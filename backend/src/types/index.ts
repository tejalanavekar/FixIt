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

//Typescript types for exporting the interfaces 