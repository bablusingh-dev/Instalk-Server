import { User } from '@/models/userModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { NextFunction, Response } from 'express'

export default {
    getUsers: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId
            const page = parseInt(req.query['page'] as string) || 1
            const limit = parseInt(req.query['limit'] as string) || 20
            const search = (req.query['search'] as string) || ''
            const skip = (page - 1) * limit

            const query = {
                _id: { $ne: userId },
                ...(search && {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                })
            }

            const [users, total] = await Promise.all([
                User.find(query).select('name email avatar').skip(skip).limit(limit).lean(),
                User.countDocuments(query)
            ])

            return httpResponse(req, res, 200, 'Users fetched successfully', {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            })
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    }
}
