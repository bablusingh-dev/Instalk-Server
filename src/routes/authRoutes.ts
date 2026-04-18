import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit'
import authMiddleware from '@/middlewares/authMiddleware'
import authController from '@/controllers/authController'

const router = Router()

router.use(rateLimit)


router.route('/me').get(authMiddleware.protectRoute, authController.me)
router.route('/callback').get(authController.callback)

export default router
