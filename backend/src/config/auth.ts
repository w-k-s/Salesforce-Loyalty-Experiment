import { type IdentityProviderConfig } from './types.js'

export default {
    connection: {
        authUrl: process.env.AUTH_BASE_URL,
        tenant: process.env.AUTH_USER_REALM,
        clientId: process.env.AUTH_ADMIN_CLIENT_ID,
        clientSecret: process.env.AUTH_ADMIN_CLIENT_SECRET,
        jwksUri: process.env.KEYCLOAK_JWKS_URI
    },
    useLocal: process.env.USE_LOCAL_IDENTITY_PROVIDER == 'true' || false
} satisfies IdentityProviderConfig;
