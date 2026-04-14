import { type Document } from 'mongoose'

export interface IUser extends Document {
    clerkId: string
    name: string
    email: string
    avatar: string
    createdAt: Date
    updatedAt: Date
}

export interface IUserResponse {
    _id: string
    clerkId: string
    name: string
    email: string
    avatar: string
    createdAt: Date
    updatedAt: Date
}
