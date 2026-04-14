import { Router } from 'express'
import apiController from '../controllers/apiController'
import rateLimit from '../middlewares/rateLimit'

const router = Router()

router.use(rateLimit)

router.route('/').get(apiController.self)
router.route('/health').get(apiController.health)

export default router
