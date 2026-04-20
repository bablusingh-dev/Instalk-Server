import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
    // General
    ENV: process.env['ENV'],
    PORT: process.env['PORT'],
    SERVER_URL: process.env['SERVER_URL'],
    CLIENT_URL: process.env['CLIENT_URL'],
    MOBILE_CLIENT_URL: process.env['MOBILE_CLIENT_URL'],

    // Database
    DATABASE_URL: process.env['DATABASE_URL'],

    // Clerk
    CLERK_SECRET_KEY: process.env['CLERK_SECRET_KEY'],
    CLERK_PUBLISHABLE_KEY: process.env['CLERK_PUBLISHABLE_KEY'],
} as const
