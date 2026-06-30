import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware'
import { generate, retryQuiz } from '../sandbox/sandbox.controller'

const router = Router()

router.use(requireAuth)
router.post('/generate', generate)
router.post('/quiz-retry', retryQuiz)

export default router