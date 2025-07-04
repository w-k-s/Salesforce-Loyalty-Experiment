const cache: Record<string, any> = {};

export const get = async (key: string): Promise<any> => {
    return cache[key];
}

export const set = (key: string, value: any, { timeToLiveSeconds: number }): Promise<any> => {
    cache[key] = value;
    return Promise.resolve()
}