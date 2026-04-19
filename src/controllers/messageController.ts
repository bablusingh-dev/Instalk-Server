import { Chat } from '@/models/chatModel'
import { Message } from '@/models/messageModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { NextFunction, Response } from 'express'

export default {
    getChatMessages: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const chatId = req.params['chatId']
            const userId = req.userId
            const page = parseInt(req.query['page'] as string) || 1
            const limit = parseInt(req.query['limit'] as string) || 20
            const skip = (page - 1) * limit

            const chat = await Chat.findOne({ _id: chatId, participants: userId })
            if (!chat) {
                return httpError(next, new Error('Chat not found or access denied'), req, 404)
            }

            const [messages, total] = await Promise.all([
                Message.find({ chat: chatId }).populate('sender', 'name email avatar').sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
                Message.countDocuments({ chat: chatId})
            ])

            return httpResponse(req, res, 200, 'Messages fetched successfully', {
                messages,
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
