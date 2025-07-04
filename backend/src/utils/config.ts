
import knex from 'knex'

const DB_CLIENT = process.env.DB_CLIENT || 'pg'
const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = parseInt(process.env.DB_PORT) || 5432;
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME || 'loyalty'

export const db = knex({
    client: DB_CLIENT,
    connection: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_NAME,
    },
});

export const authentication = {
    baseUrl: process.env.AUTH_BASE_URL,
    userRealm: process.env.AUTH_USER_REALM,
    adminClientId: process.env.AUTH_ADMIN_CLIENT_ID,
    adminClientSecret: process.env.AUTH_ADMIN_CLIENT_SECRET,
    issuerUrl: process.env.KEYCLOAK_ISSUER_URL
};

