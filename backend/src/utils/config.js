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
    adminClientSecret: process.env.AUTH_ADMIN_CLIENT_SECRET
};

const KEYCLOAK_ISSUER_URL = process.env.KEYCLOAK_ISSUER_URL
const OPENID_CLIENT_ID = process.env.OPENID_CLIENT_ID
const OPENID_CLIENT_SECRET = process.env.OPENID_CLIENT_SECRET
const OPENID_REDIRECT_URI = process.env.OPENID_REDIRECT_URI
const OPENID_POST_LOGOUT_REDIRECT_URI = process.env.OPENID_POST_LOGOUT_REDIRECT_URI

export const getConfiguredPassport = async () => {

    const issuer = await Issuer.discover(KEYCLOAK_ISSUER_URL)
    const client = new issuer.Client({
        client_id: OPENID_CLIENT_ID,
        client_secret: OPENID_CLIENT_SECRET,
        redirect_uris: [OPENID_REDIRECT_URI],
        post_logout_redirect_uris: [OPENID_POST_LOGOUT_REDIRECT_URI],
        response_types: ['code'],
    });

    // Part 3b, configure the passport strategy
    passport.use('oidc', new Strategy({ client }, (tokenSet, userinfo, done) => {
        return done(null, tokenSet.claims());
    }))

    passport.use('m2m', new ClientCredentialsStrategy({
        userInfoURL: issuer.userinfo_endpoint,
    }, (userInfo, done) => {
        console.log('m2m', userInfo);
        return done(null, userInfo);
    }))

    // Part 3d, tell passport how to serialize and deserialize user data
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    return passport;
};

