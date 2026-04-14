import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit'

const router = Router()

router.use(rateLimit)


export default router
