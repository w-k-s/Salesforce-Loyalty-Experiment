import dotenv from 'dotenv';
import passport from 'passport';
import { Issuer, Strategy } from "openid-client"
import { salesforceLogin } from './salesforce.js';
import { Strategy as ClientCredentialsStrategy } from '../auth/client-credentials.strategy.js';
import knex from 'knex'

dotenv.config();

const SALESFORCE_USERNAME = process.env.SALESFORCE_USERNAME
const SALESFORCE_PASSWORD = process.env.SALESFORCE_PASSWORD
const SALESFORCE_TOKEN = process.env.SALESFORCE_TOKEN

export const salesforceConnection = await salesforceLogin(
    SALESFORCE_USERNAME,
    SALESFORCE_PASSWORD,
    SALESFORCE_TOKEN
)

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


