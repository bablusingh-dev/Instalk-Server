import { User } from '@/models/userModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { NextFunction, Response } from 'express'

export default {
    getUsers: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId
            const pageRaw = Number(req.query['page'])
            const limitRaw = Number(req.query['limit'])
            const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
            const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20
            const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const search = (req.query['search'] as string) || ''
            const safeSearch = escapeRegex(search)
            const skip = (page - 1) * limit

            const query = {
                _id: { $ne: userId },
                ...(search && {
                    $or: [{ name: { $regex: safeSearch, $options: 'i' } }, { email: { $regex: safeSearch, $options: 'i' } }]
                })
            }

            const [users, total] = await Promise.all([
                User.find(query).select('name email avatar').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
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

