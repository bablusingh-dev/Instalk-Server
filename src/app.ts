import express, { Application, NextFunction, Request, Response } from 'express'
import path from 'path'
import router from './routes/apiRoutes'
import globalErrorHandler from './middlewares/globalErrorHandler'
import responseMessage from './constants/responseMessage'
import httpError from './utils/httpError'
import helmet from 'helmet'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import messageRoutes from './routes/messageRoutes'
import chatRoutes from './routes/chatRoutes'
import { clerkMiddleware } from '@clerk/express'
import config from './configs/config'

const app: Application = express()

// Middleware
app.use(helmet())
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        origin: [config.CLIENT_URL!, config.MOBILE_CLIENT_URL!],
        credentials: true
    })
)
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

app.use(clerkMiddleware())

// Routes
app.use('/', router)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/chats', chatRoutes)

// 404 Handler
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('route'))
    } catch (err) {
        httpError(next, err, req, 404)
    }
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
