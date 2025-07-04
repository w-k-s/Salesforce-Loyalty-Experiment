export interface Cache {
    get(key: string): Promise<any>,
    set(key: string, value: any, { timeToLiveSeconds }): Promise<any>
}