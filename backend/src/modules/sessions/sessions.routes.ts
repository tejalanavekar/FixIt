import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware'
import { create, list, getDetail, update, remove, updateSandbox, submitAttempt, stats } from './sessions.controller'

const router = Router()

router.use(requireAuth)
router.get('/stats', stats)
router.get('/', list)
router.post('/', create)
router.get('/:id', getDetail)
router.patch('/:id', update)
router.delete('/:id', remove)
router.patch('/:id/sandbox', updateSandbox)
router.post('/:id/attempts', submitAttempt)

export default router
