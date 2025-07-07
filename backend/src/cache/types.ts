export type Options = {
    timeToLiveSeconds: number
}

export interface Cache {
    get(key: string): Promise<any>,
    set(key: string, value: any, options?: Options): Promise<any>
    invalidate(key: string): Promise<any>
}