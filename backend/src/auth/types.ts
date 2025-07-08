export interface CreateUserRequest {
    contactId: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    mobileNumber: string;
    password: string;
}

export interface User {
    userId: string;
    contactId: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    mobileNumber: string;
    roles: string[];
    scopes: string[]
}

export interface AuthenticationService {
    createUser(request: CreateUserRequest): Promise<User | 'USER_EXISTS'>
    getUserByUsername(username: string): Promise<User | 'NOT_FOUND'>
}

export type UserId = string