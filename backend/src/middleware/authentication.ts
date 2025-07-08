import config from "../config/index.js";
import { auth as oauth2, claimCheck } from 'express-oauth2-jwt-bearer'
import auth, { type User } from '../auth/index.js'

const { getUserByUsername } = auth

const localAuthentication = (requiredScopes = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).set('WWW-Authenticate', 'Basic').send('Authentication required.');
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const [username, password] = credentials.split(':');

        if (!username || !password) {
            return res.status(400).send('Invalid Authorization header.');
        }

        const user: User | 'NOT_FOUND' = await getUserByUsername(username)
        req.user = {}
        if (user !== 'NOT_FOUND') {
            // TODO: assign member roles
            req.user.id = user.contactId
        } else if (username === 'partner-client') {
            // TODO: assign partner roles
            req.user.id = username
        } else {
            return res.status(401).send({ "error": "Unauthorized" })
        }

        // TODO: check scopes
    }
}


const remoteAuthentication = (requiredScopes = []) => {
    return claimCheck((claims) => {
        const roles = (claims.realm_access as any).roles || []
        return requiredScopes.every(scope => roles.includes(scope));
    })
}

export const requiresAuthentication = config.auth.useLocal ? localAuthentication : remoteAuthentication;