import client from "jsforce/lib/browser/client";

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

        let formData = new FormData();
        formData.append('grant_type', 'client_credentials');
        formData.append('client_id', adminClientId);
        formData.append('client_secret', adminClientSecret);

        const { access_token: accessToken } = await fetch(`${baseUrl}/auth/realms/master/protocol/openid-connect/token`, {
            method: 'post',
            body: new FormData(formData),
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
        fetch(`${baseUrl}/auth/admin/realms/${userRealm}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/josn'
            },
            body: JSON.stringify({
                ...user,
                emailVerified: false,
                emabled: false
            })
        })
    }

    return {
        createUser
    }
}