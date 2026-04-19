import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit'
import authMiddleware from '@/middlewares/authMiddleware'
import userController from '@/controllers/userController'

const router = Router()

router.use(rateLimit)

router.route('/users').get(authMiddleware.protectRoute, userController.getUsers)

export default router
