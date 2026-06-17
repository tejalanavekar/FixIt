//Controller layer, handles HTTP requests and responses for the sandbox module
//Received HTTP request -> validate input -> call AI -> response with result

import { Request, Response } from 'express'
import { generateSandbox } from '../ai/ai.service'

export const generate = async (req: Request, res: Response) =>{
    try {
        const {userInput} = req.body

        if (!userInput || typeof userInput !== 'string') {
            return res.status(400).json({ error: 'userInput is required' })
        }
        if (userInput.trim().length < 3) {
      return res.status(400).json({ error: 'userInput is too short' })
    }

        const sandbox = await generateSandbox(userInput)
        return res.status(200).json({ sandbox })
    } catch (error) {
        console.error('Sandbox generation error:', error)
        res.status(500).json({ error: 'Failed to generate sandbox', message: error instanceof Error ? error.message : 'Unknown error' })
    }
}