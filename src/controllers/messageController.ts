import { Chat } from '@/models/chatModel'
import { Message } from '@/models/messageModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { NextFunction, Response } from 'express'
import mongoose from 'mongoose'

export default {
    getChatMessages: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const chatId = req.params['chatId'] as string
            const userId = req.userId
            const pageRaw = Number(req.query['page'])
            const limitRaw = Number(req.query['limit'])
            const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
            const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20
            const skip = (page - 1) * limit

            const chat = await Chat.findOne({ _id: chatId, participants: userId })
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                return httpError(next, new Error('Invalid chatId'), req, 400)
            }
            if (!chat) {
                return httpError(next, new Error('Chat not found or access denied'), req, 404)
            }

            const [messages, total] = await Promise.all([
                Message.find({ chat: chatId }).populate('sender', 'name email avatar').sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
                Message.countDocuments({ chat: chatId })
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
