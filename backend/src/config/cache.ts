import { type CacheConfig } from './types.js'

export default {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    useLocal: process.env.USE_LOCAL || true
} as CacheConfig;