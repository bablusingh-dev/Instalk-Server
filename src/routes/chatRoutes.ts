import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit'
import chatController from '@/controllers/chatController'
import authMiddleware from '@/middlewares/authMiddleware'

const router = Router()

router.use(rateLimit)

router.route('/chats').get(authMiddleware.protectRoute, chatController.getChats)
router.route('/with/:participantId').post(authMiddleware.protectRoute, chatController.getOrCreateChatWithUser)

export default router
