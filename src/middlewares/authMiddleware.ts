import { User } from '@/models/userModel'
import httpError from '@/utils/httpError'
import { getAuth } from '@clerk/express'
import { AuthRequest } from '@/types/types'
import { NextFunction, Response } from 'express'

export default {
    protectRoute: async (req: AuthRequest, _res: Response, next: NextFunction) => {
        try {
            const { userId: clerkId } = getAuth(req)
            if (!clerkId) {
                return httpError(next, new Error('Unauthorized  --Invalid Token'), req, 401)
            }
            const user = await User.findOne({ clerkId })
            if (!user) {
                return httpError(next, new Error('Unauthorized  --User not found'), req, 401)
            }
            req.userId = user._id.toString()
            next()
        } catch (error) {
            return httpError(next, error, req, 401)
        }
    }
}
