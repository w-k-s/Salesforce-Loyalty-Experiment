import { type IdentityProviderConfig } from './types.js'

const identityConfig: IdentityProviderConfig = {
    connection: {
        authUrl: process.env.AUTH_BASE_URL!!,
        tenant: process.env.AUTH_USER_REALM!!,
        clientId: process.env.AUTH_ADMIN_CLIENT_ID!!,
        clientSecret: process.env.AUTH_ADMIN_CLIENT_SECRET!!,
        issuerUrl: process.env.AUTH_ISSUER_URL!!,
        audience: process.env.AUTH_AUDIENCE
    },
    useLocal: process.env.USE_LOCAL_IDENTITY_PROVIDER == 'true' || false
}

export default identityConfig
