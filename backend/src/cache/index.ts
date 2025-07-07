import { type Cache } from './types.js'
import { default as config } from '../config/index.js'
import { get as localGet, set as localSet, invalidate as localInvalidate } from './local.js'
import { get as redisGet, set as redisSet, invalidate as redisInvalidate } from './redis.js'

const { cache: cacheConfig } = config

const cache: Cache = {
    get: cacheConfig.useLocal ? localGet : redisGet,
    set: cacheConfig.useLocal ? localSet : redisSet,
    invalidate: cacheConfig.useLocal ? localInvalidate : redisInvalidate
}

export default cache