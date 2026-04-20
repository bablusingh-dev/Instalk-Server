import config from '@/configs/config'
import { User } from '@/models/userModel'
import { verifyToken } from '@clerk/express'
import { Server as HttpServer } from 'node:http'
import { Socket, Server as SocketServer } from 'socket.io'

interface SocketWithUserId extends Socket {
    userId?: string
}
export const initializeSocket = (httpServer: HttpServer) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: [config.CLIENT_URL!, config.MOBILE_CLIENT_URL!]
        }
    })
    io.use((socket, next) => {
        const token = socket.handshake.auth['token'] as string | undefined
        if (!token) {
            return next(new Error('Authentication token is required'))
        }

        verifyToken(token, { secretKey: config.CLERK_SECRET_KEY })
            .then(async (data) => {
                const clerkId = data.sub
                const user = await User.findOne({ clerkId })
                if (!user) {
                    return next(new Error('User not found'))
                }
                ;(socket as SocketWithUserId).userId = user._id.toString()
                next()
            })
            .catch(() => {
                next(new Error('Authentication failed'))
            })
    })
}
