import { Response } from 'express'
import { AuthedRequest } from '../../middleware/auth.middleware'
import * as sessionsService from './sessions.service'

export const create = async (req: AuthedRequest, res: Response) => {
  try {
    const { title, userInput, sandbox } = req.body
    if (!title || !userInput || !sandbox) {
      return res.status(400).json({ error: 'title, userInput and sandbox are required' })
    }
    const result = await sessionsService.createSession(req.user!.dbId, title, userInput, sandbox)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' })
  }
}

export const list = async (req: AuthedRequest, res: Response) => {
  try {
    const sessions = await sessionsService.listSessions(req.user!.dbId)
    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ error: 'Failed to list sessions' })
  }
}

export const getDetail = async (req: AuthedRequest, res: Response) => {
  try {
    const result = await sessionsService.getSessionDetail(String(req.params.id), req.user!.dbId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load session' })
  }
}

export const update = async (req: AuthedRequest, res: Response) => {
  try {
    const { title, status, bookmarked } = req.body
    const session = await sessionsService.updateSessionMeta(String(req.params.id), req.user!.dbId, { title, status, bookmarked })
    res.json({ session })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' })
  }
}

export const remove = async (req: AuthedRequest, res: Response) => {
  try {
    await sessionsService.deleteSession(String(req.params.id), req.user!.dbId)
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' })
  }
}

export const updateSandbox = async (req: AuthedRequest, res: Response) => {
  try {
    const { quizQuestion, quizOptions, quizCorrectIndex, isSolved, currentCode, progress } = req.body
    const sandbox = await sessionsService.updateSandbox(String(req.params.id), { quizQuestion, quizOptions, quizCorrectIndex, isSolved, currentCode, progress })
    res.json({ sandbox })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sandbox' })
  }
}

export const submitAttempt = async (req: AuthedRequest, res: Response) => {
  try {
    const { submittedCode, isCorrect } = req.body
    if (!submittedCode) {
      return res.status(400).json({ error: 'submittedCode is required' })
    }
    await sessionsService.recordAttempt(String(req.params.id), submittedCode, !!isCorrect)
    res.status(201).json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record attempt' })
  }
}

export const stats = async (req: AuthedRequest, res: Response) => {
  try {
    const profile = await sessionsService.getProfileStats(req.user!.dbId, req.user!.authId)
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load profile stats' })
  }
}
