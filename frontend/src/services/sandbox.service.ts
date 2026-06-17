import axios from 'axios'
import type { SandboxResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL

export const generateSandbox = async (userInput: string): Promise<SandboxResponse> => {
  const response = await axios.post(`${API_URL}/api/sandbox/generate`, {
    userInput
  })
  return response.data.sandbox
}