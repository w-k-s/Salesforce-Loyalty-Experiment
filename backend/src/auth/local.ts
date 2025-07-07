import { CreateUserRequest, User } from './types.js'

const localDb: Record<string, User> = {}

export const createUser = async (request: CreateUserRequest): Promise<User | 'duplicate'> => {
    if (request.email in localDb) {
        return Promise.resolve('duplicate')
    }

    const user: User = { ...request, userId: '', roles: [], scopes: [] }
    localDb[user.email] = user
    return Promise.resolve(user)
}

export const getUserByUsername = async (username: string): Promise<User | 'notfound'> => {
    const user = localDb[username]
    if (!user) {
        return Promise.resolve('notfound')
    }
    return Promise.resolve(user)
}
