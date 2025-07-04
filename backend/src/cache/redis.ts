import { createClient } from 'redis';
import { default as config } from '../config/index.js'
const { cache } = config;

const client = createClient({
    url: cache.connection.url
})
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

export const set = async (key: string, value: any, options = { timeToLiveSeconds: 0 }): Promise<any> => {
    if (options.timeToLiveSeconds > 0) {
        return await client.set(key, value, { EX: options.timeToLiveSeconds })
    }
    return await client.set(key, value)
}

export const get = async (key: string): Promise<any> => {
    return client.get(key)
}