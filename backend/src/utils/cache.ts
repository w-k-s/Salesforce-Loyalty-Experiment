import { createClient } from 'redis';

export default async ({
    connectionUrl
}) => {
    const client = createClient({
        url: connectionUrl
    })
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

    const set = (key, value, options = { timeToLiveSeconds: 0 }) => {
        if (options.timeToLiveSeconds > 0) {
            return client.set(key, value, { EX: options.timeToLiveSeconds })
        }
        return client.set(key, value)
    }

    const get = async (key) => {
        return client.get(key)
    }

    return {
        set,
        get
    }
}