import { createClient } from 'redis';

export default async ({
    connectionUrl
}) => {
    const client = createClient({
        url: connectionUrl
    })
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

    const set = async (key, value, { timeToLiveSeconds }) => {
        if (timeToLiveSeconds > 0) {
            return client.set(key, value, { EX: timeToLiveSeconds })
        }
        return client.set(key, value)
    }

    const get = async (key) => client.get(key)

    return {
        set,
        get
    }
}