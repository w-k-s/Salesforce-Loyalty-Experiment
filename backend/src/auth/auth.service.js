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
    adminClientSecret
}) => {

    let token = null
    const getAdminToken = async () => {
        // supposed to be a cache access
        if (token) {
            return token
        }

        try {
            let form = {
                'grant_type': 'client_credentials',
                'client_id': adminClientId,
                'client_secret': adminClientSecret
            }
            let formBody = [];
            for (var key in form) {
                var encodedKey = encodeURIComponent(key);
                var encodedValue = encodeURIComponent(form[key]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
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
            token = accessToken
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
                    emailVerified: false,
                    enabled: false,
                    attributes: {
                        contactId: user.id,
                        mobileNumber: user.mobileNumber,
                    }
                })
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(JSON.stringify(error));
            }
            const json = await response.json()
            console.log(json)
        } catch (error) {
            console.error('Failed to create user on keycloak:', error);
        }
    }

    return {
        createUser
    }
}