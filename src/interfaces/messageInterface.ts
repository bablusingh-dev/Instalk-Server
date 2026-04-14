import mongoose, { type Document } from 'mongoose'

export interface IMessage extends Document {
    chat: mongoose.Types.ObjectId
    sender: mongoose.Types.ObjectId
    text: string
    createdAt: Date
    updatedAt: Date
}

export interface IMessageResponse {
    _id: string
    chat: string
    sender: string
    text: string
    createdAt: Date
    updatedAt: Date
}
