import { CreateUserRequest, User } from './types.js';
import { kcFetch, getRealmRoles } from './keycloakClient.js';
import config from '../config/index.js';
import { UserRepresentation } from './internal-types.js';

const { auth } = config;

export const createUser = async (user: CreateUserRequest): Promise<User | 'USER_EXISTS'> => {
    const { res, json } = await kcFetch(
        `/admin/realms/${auth.connection.tenant}/users`,
        {
            method: 'POST',
            body: JSON.stringify({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                emailVerified: user.emailVerified,
                enabled: true,
                attributes: {
                    customerId: user.contactId,
                    mobileNumber: user.mobileNumber,
                },
                credentials: [{
                    type: "password",
                    value: user.password,
                    temporary: false
                }]
            })
        }
    );

    if (!res.ok) {
        throw new Error(`createUser: ${res.status} - ${JSON.stringify(json)}`);
    }

    let userRep = await getKeycloakUserByEmail(user.email)
    if (userRep === 'NOT_FOUND') {
        throw new Error('Failed to find user');
    }

    let realmRoles = await getRealmRoles()

    await updateUserRoles(userRep.id, realmRoles.filter((role) => ['view-profile', 'loyalty-member'].includes(role.name)))

    return userRepToUser(userRep)
};

export const getUserByUsername = async (username: string): Promise<User | 'NOT_FOUND'> => {
    const userRep = await getKeycloakUserByEmail(username)

    if (userRep === 'NOT_FOUND') {
        return userRep
    }

    return userRepToUser(userRep)
};

const getKeycloakUserByEmail = async (username: string): Promise<UserRepresentation | 'NOT_FOUND'> => {
    const { res, json } = await kcFetch(
        `/admin/realms/${auth.connection.tenant}/users?username=${encodeURIComponent(username)}`,
        { method: 'GET' }
    );

    if (!res.ok || !Array.isArray(json) || json.length === 0) {
        return Promise.resolve('NOT_FOUND');
    }

    return json[0] as UserRepresentation;
};

const updateUserRoles = async (userId: string, roles: any): Promise<void> => {

    const { res, json } = await kcFetch(
        `/admin/realms/${auth.connection.tenant}/users/${userId}/role-mappings/realm`,
        {
            method: 'POST',
            body: JSON.stringify(roles),
        }
    );

    if (res.status !== 204) {
        throw new Error(`updateUserRoles: ${res.status} - ${JSON.stringify(json)}`);
    }

    return Promise.resolve()
};

const userRepToUser = (userRep: UserRepresentation): User => {

    const { customerId } = userRep.attributes

    const user: User = {
        userId: userRep.id,
        firstName: userRep.firstName,
        lastName: userRep.lastName,
        email: userRep.email,
        emailVerified: userRep.emailVerified,
        mobileNumber: '?',
        roles: [],
        scopes: [],
        contactId: customerId[0],
    }
    return user
}