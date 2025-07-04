import { default as cache } from '../cache/index.js'

const { get: cacheGet, set: cacheSet } = cache

const CACHE_KEY_REALM_ROLES = "authentication:realm-roles"
/**
 * Creates an Authentication Service
 * @param {object} authConfig Authentication Configuration
 * @param {string} authConfig.baseUrl keycloak base url
 * @param {string} authConfig.userRealm keycloak User realm
 * @param {string} authConfig.adminClientId Keycloak Client ID
 * @param {string} authConfig.adminClientSecret Keycloak Client Secret
 */
export default ({
    baseUrl,
    userRealm,
    adminClientId,
    adminClientSecret,
}) => {

    const getAdminToken = async () => {
        // supposed to be a cache access with ttl = token expiry
        try {
            let form = {
                'grant_type': 'client_credentials',
                'client_id': adminClientId,
                'client_secret': adminClientSecret
            }
            let formParts = [];
            for (var key in form) {
                var encodedKey = encodeURIComponent(key);
                var encodedValue = encodeURIComponent(form[key]);
                formParts.push(encodedKey + "=" + encodedValue);
            }
            let formBody = formParts.join("&");
            const response = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
                method: 'post',
                body: formBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error);
            }
            const { access_token: accessToken } = await response.json()
            return accessToken
        } catch (error) {
            console.error('Failed to acquire admin token:', error);
        }
    }

    /**
     * @param {Object} user User Representation
     * @param {string} user.id Unique id of the user
     * @param {string} user.firstName first name
     * @param {string=} user.middleName middle name
     * @param {string} user.lastName last name
     * @param {string} user.email User's email
     * @param {string} user.mobileNumber User's phone number
     */
    const createUser = async (user) => {
        try {
            const token = await getAdminToken()
            const response = await fetch(`${baseUrl}/admin/realms/${userRealm}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    emailVerified: true,
                    enabled: true,
                    attributes: {
                        customerId: user.id,
                        mobileNumber: user.mobileNumber,
                    },
                    credentials: [{
                        type: "password",
                        value: user.password,
                        temporary: false
                    }]
                })
            })
            let json = ''
            const contentLength = response.headers.get("Content-Length");
            if (contentLength && parseInt(contentLength, 10) > 0) {
                console.log('parsing json')
                json = await response.json()
            }
            if (!response.ok) {
                throw new Error(JSON.stringify(response.statusText));
            }
            console.log(json)
        } catch (error) {
            throw error
        }
    }

    /**
     * @param {string} username user's username
     */
    const getUserByUsername = async (username) => {
        try {
            const token = await getAdminToken()
            const response = await fetch(`${baseUrl}/admin/realms/${userRealm}/users?username=${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'get'
            })

            let json = ''
            const contentLength = response.headers.get("Content-Length");
            if (contentLength && parseInt(contentLength, 10) > 0) {
                console.log('parsing json')
                json = await response.json()
            }
            if (!response.ok) {
                throw new Error(`${response.statusText} - ${json}`);
            }
            const [user] = json
            return user
        } catch (error) {
            throw error
        }
    }

    // admin-cli must have view-roles role in loyalty realm
    const getRealmRoles = async () => {
        let realmRoles = await cacheGet(CACHE_KEY_REALM_ROLES)
        if (realmRoles) {
            return JSON.parse(realmRoles)
        }

        const token = await getAdminToken()
        const response = await fetch(`${baseUrl}/admin/realms/${userRealm}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        let json = ''
        const contentLength = response.headers.get("Content-Length");
        if (contentLength && parseInt(contentLength, 10) > 0) {
            console.log('parsing json')
            json = await response.json()
        }
        if (!response.ok) {
            throw new Error(`${response.statusText} - ${JSON.stringify(json)}`);
        }

        await cacheSet(CACHE_KEY_REALM_ROLES, JSON.stringify(json), { timeToLiveSeconds: 10 * 60 })
        return json
    }

    const updateUserRoles = async ({ userId, roles }) => {

        const token = await getAdminToken()
        const response = await fetch(`${baseUrl}/admin/realms/${userRealm}/users/${userId}/role-mappings/realm`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'post',
            body: JSON.stringify(roles)
        })

        const success = response.status == 204

        if (!success) {
            let json = ''
            const contentLength = response.headers.get("Content-Length");
            if (contentLength && parseInt(contentLength, 10) > 0) {
                console.log('parsing json')
                json = await response.json()
            }
            throw new Error(`${response.statusText} - ${JSON.stringify(json)}`);
        }

        return success
    }

    return {
        createUser,
        getUserByUsername,
        getRealmRoles,
        updateUserRoles
    }
}