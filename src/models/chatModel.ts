import { IChat } from '@/interfaces/chatInterface'
import mongoose, { Schema } from 'mongoose'

const ChatSchema = new Schema<IChat>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
)

export const Chat = mongoose.model('Chat', ChatSchema)
