import { Options } from './types.js'

const cache: Record<string, any> = {};

export const get = async (key: string): Promise<any> => {
    return cache[key];
}

export const set = async (key: string, value: any, options: Options): Promise<void> => {
    cache[key] = value;
}

export const invalidate = async (key: string): Promise<void> => {
    delete cache[key];
}

