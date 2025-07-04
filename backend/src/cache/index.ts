import { type Cache } from './types.js'
import { default as config } from '../config/index.js'
import { get as localGet, set as localSet } from './local.js'
import { get as redisGet, set as redisSet } from './redis.js'

const { cache } = config

export default {
    get: cache.useLocal ? localGet : redisGet,
    set: cache.useLocal ? localSet : redisSet,
} satisfies Cache