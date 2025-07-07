import { CreateUserRequest, User } from './types.js'

const localDb: Record<string, User> = {}

export const createUser = async (request: CreateUserRequest): Promise<User | 'USER_EXISTS'> => {
    if (request.email in localDb) {
        return Promise.resolve('USER_EXISTS')
    }

    const user: User = { ...request, userId: '', roles: [], scopes: [] }
    localDb[user.email] = user
    return Promise.resolve(user)
}

export const getUserByUsername = async (username: string): Promise<User | 'NOT_FOUND'> => {
    const user = localDb[username]
    if (!user) {
        return Promise.resolve('NOT_FOUND')
    }
    return Promise.resolve(user)
}
