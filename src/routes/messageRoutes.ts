import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit'
import authMiddleware from '@/middlewares/authMiddleware'
import messageController from '@/controllers/messageController'

const router = Router()

router.use(rateLimit)
router.route('/chat/:chatId').get(authMiddleware.protectRoute, messageController.getChatMessages)

export default router
