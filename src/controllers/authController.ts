import responseMessage from '@/constants/responseMessage'
import { User } from '@/models/userModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { clerkClient, getAuth } from '@clerk/express'
import { NextFunction, Response, Request } from 'express'

export default {
    me: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId
            if (!userId) {
                return httpError(next, new Error('Unauthorized  --User not found'), req, 401)
            }
            const user = await User.findById(userId)
            if (!user) {
                return httpError(next, new Error('Unauthorized  --User not found'), req, 401)
            }
            return httpResponse(req, res, 200, responseMessage.SUCCESS, user)
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    },
    callback: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId: clerkId } = getAuth(req)
            if (!clerkId) {
                return httpError(next, new Error('Unauthorized'), req, 401)
            }
            const user = await User.findOne({ clerkId })
            if (!user) {
                const clerkUser = await clerkClient.users.getUser(clerkId)
                const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
                const fullName = clerkUser.firstName
                    ? `${clerkUser.firstName}" "${clerkUser.lastName}`
                    : clerkUser.emailAddresses[0]?.emailAddress.split('@')[0]

                await User.findOneAndUpdate(
                    { clerkId },
                    {
                        $setOnInsert: { clerkId, email: primaryEmail, name: fullName, avatar: clerkUser.imageUrl ?? '' }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )
            }

            return httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    }
}
