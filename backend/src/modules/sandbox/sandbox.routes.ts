import { Router } from 'express'
import { generate } from '../sandbox/sandbox.controller'

const router = Router()

router.post('/generate', generate)

export default router