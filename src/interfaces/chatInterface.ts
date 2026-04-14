import mongoose, { type Document } from 'mongoose'

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[]
    lastMessage?: mongoose.Types.ObjectId
    lastMessageAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface IChatResponse {
    _id: string
    participants: string[]
    lastMessage: string
    lastMessageAt: Date
    createdAt: Date
    updatedAt: Date
}
