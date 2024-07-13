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
        if (token) {
            return token
        }

        var form = {
            'grant_type': 'client_credentials',
            'client_id': adminClientId,
            'client_secret': adminClientSecret
        }
        var formBody = [];
        for (var key in form) {
            var encodedKey = encodeURIComponent(key);
            var encodedValue = encodeURIComponent(form[key]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");


        const { access_token: accessToken } = await fetch(`${baseUrl}/auth/realms/master/protocol/openid-connect/token`, {
            method: 'post',
            body: formBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        token = accessToken
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
        const token = await getAdminToken()
        console.log(`${baseUrl}/auth/admin/realms/${userRealm}/users`)
        const result = await fetch(`${baseUrl}/admin/realms/${userRealm}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'post',
            body: JSON.stringify({
                ...user,
                emailVerified: false,
                emabled: false
            })
        })
        console.log(result)
    }

    return {
        createUser
    }
}