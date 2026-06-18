//Creating the openai client
import OpenAI from 'openai'
import { z } from 'zod'
import { env } from '../../config/env'
import { SANDBOX_SYSTEM_PROMPT, userPrompt } from './ai.prompts';

export const openai = new OpenAI({
  apiKey: env.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1'
})

const SyntaxBreakdownSchema = z.object({
  syntax: z.string(),
  explanation: z.string()
})

const SandboxSchema = z.object({
  title: z.string(),
  language: z.string(),
  concept: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number(),
  conceptOverview: z.string(),
  realWorldAnalogy: z.string(),
  requestFlow: z.string(),
  syntaxBreakdown: z.array(SyntaxBreakdownSchema),
  brokenCode: z.string(),
  task: z.string(),
  hints: z.array(z.string()).length(3),
  solutionCode: z.string(),
  quizQuestion: z.string(),
  quizOptions: z.array(z.string()).length(4),
  quizCorrectIndex: z.number().min(0).max(3),
  skills: z.array(z.string()).optional().default([])
})

export type SandboxData = z.infer<typeof SandboxSchema>

export const generateSandbox = async (userInput: string): Promise<SandboxData> => {
  
  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SANDBOX_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: userPrompt(userInput)
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  // Get the response text
  const rawContent = completion.choices[0]?.message?.content

  if (!rawContent) {
    throw new Error('OpenAI returned empty response')
  }

  // Parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(rawContent)
  } catch {
    throw new Error('OpenAI returned invalid JSON')
  }

  // Validate with Zod
  const result = SandboxSchema.safeParse(parsed)

  if (!result.success) {
    console.error('Zod validation failed:', result.error.issues)
    throw new Error('AI response did not match expected schema')
  }

  return result.data

}