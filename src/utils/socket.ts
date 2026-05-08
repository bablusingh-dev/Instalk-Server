import config from '@/configs/config'
import { Chat } from '@/models/chatModel'
import { Message } from '@/models/messageModel'
import { User } from '@/models/userModel'
import { verifyToken } from '@clerk/express'
import { Server as HttpServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'

export const onlineUsers: Map<string, Set<string>> = new Map()

export const initializeSocket = (httpServer: HttpServer) => {
    const origins = [config.CLIENT_URL, config.MOBILE_CLIENT_URL].filter((url): url is string => !!url)

    if (origins.length === 0) {
        throw new Error('At least one client origin (CLIENT_URL or MOBILE_CLIENT_URL) must be configured for socket CORS.')
    }

    const io = new SocketServer(httpServer, {
        cors: {
            origin: origins
        }
    })
    io.use((socket, next) => {
        const token = socket.handshake.auth['token'] as string | undefined
        if (!token) {
            return next(new Error('Authentication token is required'))
        }

        const authenticate = async () => {
            try {
                const data = await verifyToken(token, { secretKey: config.CLERK_SECRET_KEY })
                const clerkId = data.sub
                const user = await User.findOne({ clerkId })

                if (!user || !user._id) {
                    return next(new Error('User not found'))
                }

                ;(socket.data as { userId?: string }).userId = user._id.toString()
                next()
            } catch {
                next(new Error('Authentication failed'))
            }
        }

        authenticate()
    })

    io.on('connection', (socket) => {
        const userId = (socket.data as { userId?: string }).userId
        if (!userId) {
            socket.disconnect()
            return
        }

        // send list of currently online users to the newly connected client
        socket.emit('online-users', { userIds: Array.from(onlineUsers.keys()) })

        // store user in the onlineUsers map
        let userSockets = onlineUsers.get(userId)
        let isFirstConnection = false
        if (!userSockets) {
            userSockets = new Set()
            onlineUsers.set(userId, userSockets)
            isFirstConnection = true
        }
        userSockets.add(socket.id)

        if (isFirstConnection) {
            // notify others that this current user is online
            socket.broadcast.emit('user-online', { userId })
        }
        socket.join(`user:${userId}`)

        socket.on('join-chat', async (chatId: string) => {
            try {
                const chat = await Chat.findOne({ _id: chatId, participants: userId })
                if (chat) {
                    socket.join(`chat:${chatId}`)
                } else {
                    socket.emit('socket-error', { message: 'Unauthorized to join this chat' })
                }
            } catch {
                socket.emit('socket-error', { message: 'Failed to join chat' })
            }
        })

        socket.on('leave-chat', (chatId: string) => {
            socket.leave(`chat:${chatId}`)
        })

        socket.on('send-message', async (data: { chatId: string; text: string }) => {
            try {
                const { chatId, text } = data

                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId
                })

                if (!chat) {
                    socket.emit('socket-error', { message: 'Chat not found' })
                    return
                }

                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    text
                })

                chat.lastMessage = message._id
                chat.lastMessageAt = new Date()
                await chat.save()

                await message.populate('sender', 'name avatar')

                // emit to chat room (for users inside the chat)
                io.to(`chat:${chatId}`).emit('new-message', message)

                // also emit to participants' personal rooms (for chat list view)
                for (const participantId of chat.participants) {
                    io.to(`user:${participantId.toString()}`).emit('new-message', message)
                }
            } catch {
                socket.emit('socket-error', { message: 'Failed to send message' })
            }
        })

        socket.on('typing', async (data: { chatId: string; isTyping: boolean }) => {
            try {
                const chat = await Chat.findOne({ _id: data.chatId, participants: userId })
                if (!chat) return

                const typingPayload = {
                    userId,
                    chatId: data.chatId,
                    isTyping: data.isTyping
                }

                // emit to chat room (for users inside the chat)
                socket.to(`chat:${data.chatId}`).emit('typing', typingPayload)

                // also emit to other participant's personal room (for chat list view)
                const otherParticipantId = chat.participants.find((p) => p.toString() !== userId)
                if (otherParticipantId) {
                    socket.to(`user:${otherParticipantId.toString()}`).emit('typing', typingPayload)
                }
            } catch {
                // silently fail - typing indicator is not critical
            }
        })

        socket.on('disconnect', () => {
            const userSockets = onlineUsers.get(userId)
            if (userSockets) {
                userSockets.delete(socket.id)
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId)
                    socket.broadcast.emit('user-offline', { userId })
                }
            }
        })
    })

    return io
}
