import type { SandboxResponse } from '../types'
import { apiClient } from './api'

export const generateSandbox = async (userInput: string): Promise<SandboxResponse> => {
  const response = await apiClient.post('/api/sandbox/generate', { userInput })
  return response.data.sandbox
}

export interface QuizRetryResult {
  quizQuestion: string
  quizOptions: string[]
  quizCorrectIndex: number
}

export const retryQuiz = async (concept: string, previousQuestion: string): Promise<QuizRetryResult> => {
  const response = await apiClient.post('/api/sandbox/quiz-retry', { concept, previousQuestion })
  return response.data.quiz
}
