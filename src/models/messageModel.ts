import { IMessage } from '@/interfaces/messageInterface'
import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema<IMessage>(
    {
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
)

MessageSchema.index({ chat: 1, createdAt: 1 }) // oldest one first

export const Message = mongoose.model('Message', MessageSchema)
