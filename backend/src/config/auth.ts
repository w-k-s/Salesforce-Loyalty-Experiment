import { type IdentityProviderConfig } from './types.js'

export default {
    connection: {
        authUrl: process.env.AUTH_BASE_URL,
        tenant: process.env.AUTH_USER_REALM,
        clientId: process.env.AUTH_ADMIN_CLIENT_ID,
        clientSecret: process.env.AUTH_ADMIN_CLIENT_SECRET,
        issuerUrl: process.env.KEYCLOAK_ISSUER_URL
    },
    useLocal: process.env.USE_LOCAL_IDENTITY_PROVIDER == 'true' || true
} satisfies IdentityProviderConfig;
