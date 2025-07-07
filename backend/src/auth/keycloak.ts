import { CreateUserRequest, UserId } from './types.js';
import { kcFetch, getRealmRoles } from './keycloakClient.js';
import cache from '../cache/index.js';
import config from '../config/index.js';
import { UserRepresentation } from './internal-types.js';

const { auth } = config;
const { get: cacheGet, set: cacheSet } = cache;

const createUserCacheKey = (user: CreateUserRequest) => `keycloak:user:${user.email}`;
const assignRoleCacheKey = (user: CreateUserRequest) => `keycloak:role:${user.email}`;

export const createUser = async (user: CreateUserRequest): Promise<UserId> => {
    let userId = await cacheGet(createUserCacheKey(user));
    if (!userId) {
        let userRep = await getUserByUsername(user.email)
        if (userRep !== 'notfound') {
            userId = userRep.id
        } else {
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

            let userRep = await getUserByUsername(user.email)
            if (userRep !== 'notfound') {
                await cacheSet(createUserCacheKey(user), userRep.id)
            }
        }
    }

    let rolesAssigned = await cacheGet(assignRoleCacheKey(user));
    if (!rolesAssigned) {
        await updateUserRoles(userId, await getRealmRoles())
        await cacheSet(assignRoleCacheKey(user), userId)
    }

    return Promise.resolve(userId)
};

export const getUserByUsername = async (username: string): Promise<UserRepresentation | 'notfound'> => {
    const { res, json } = await kcFetch(
        `/admin/realms/${auth.connection.tenant}/users?username=${encodeURIComponent(username)}`,
        { method: 'GET' }
    );

    if (!res.ok || !Array.isArray(json) || json.length === 0) {
        return Promise.resolve('notfound');
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
