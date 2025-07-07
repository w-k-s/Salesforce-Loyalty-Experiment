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
    createUser(request: CreateUserRequest): Promise<User | 'duplicate'>
    getUserByUsername(username: string): Promise<User | 'notfound'>
}

export type UserId = string