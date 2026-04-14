import { IUser } from '@/interfaces/userInterface'
import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema<IUser>(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        avatar: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model('User', UserSchema)
