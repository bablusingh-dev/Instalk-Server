import { Chat } from '@/models/chatModel'
import { User } from '@/models/userModel'
import { AuthRequest } from '@/types/types'
import httpError from '@/utils/httpError'
import httpResponse from '@/utils/httpResponse'
import { NextFunction, Response } from 'express'
import mongoose from 'mongoose'

export default {
    getChats: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId
            const chats = await Chat.find({ participants: userId })
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .sort({ updatedAt: -1 })
                .lean()
            // filterout current user from participants
            const formattedChats = chats.map((chat) => {
                const otherParticipants = chat.participants.filter((p: { _id: { toString: () => string } }) => p._id.toString() !== userId)
                return {
                    ...chat,
                    participants: otherParticipants
                }
            })
            return httpResponse(req, res, 200, 'Chats fetched successfully', formattedChats)
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    },
    getOrCreateChatWithUser: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId!
            const participantId = req.params['participantId'] as string
            if (!mongoose.Types.ObjectId.isValid(participantId)) {
                return httpError(next, new Error('Invalid participantId'), req, 400)
            }
            if (userId === participantId) {
                return httpError(next, new Error('Cannot create chat with yourself'), req, 400)
            }
            let chat = await Chat.findOne({ participants: { $all: [userId, participantId] }, $size: 2 })
                .populate('participants', 'name email avatar')
                .populate('lastMessage')
                .lean()
            if (!chat) {
                const participantExists = await User.exists({ _id: participantId })
                if (!participantExists) {
                    return httpError(next, new Error('Participant not found'), req, 404)
                }
                chat = await Chat.create({ participants: [userId, participantId] })
                chat = await Chat.findById(chat._id).populate('participants', 'name email avatar').lean()

                if (!chat) {
                    return httpError(next, new Error('Chat not found after creation'), req, 500)
                }
            }

            const otherParticipants = chat.participants.filter((p: { _id: { toString: () => string } }) => p._id.toString() !== userId)
            chat.participants = otherParticipants

            return httpResponse(req, res, 200, 'Chat fetched successfully', chat)
        } catch (error) {
            return httpError(next, error, req, 500)
        }
    }
}
