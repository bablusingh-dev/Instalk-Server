import app from './app'
import config from './configs/config'
import { initRateLimiter } from './configs/rateLimiter'
import databaseService from './services/databaseService'
import logger from './utils/logger'
import { createServer } from 'http'
import { initializeSocket } from './utils/socket'

const server = createServer(app)
export const httpServer = server.listen(config.PORT)
initializeSocket(httpServer)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
    try {
        // Database Connection
        const connection = await databaseService.connect()
        logger.info(`DATABASE_CONNECTION`, {
            meta: {
                CONNECTION_NAME: connection.name
            }
        })

        initRateLimiter(connection)
        logger.info(`RATE_LIMITER_INITIATED`)

        logger.info(`APPLICATION_STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })
    } catch (err) {
        logger.error(`APPLICATION_ERROR`, { meta: err })

        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION_ERROR`, { meta: error })
            }

            process.exit(1)
        })
    }
})()

