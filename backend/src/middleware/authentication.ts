import { RequestHandler } from "express";
import config from "../config/index.js";
import { claimCheck } from 'express-oauth2-jwt-bearer'
import auth, { type User } from '../auth/index.js'
import { auth as oauth2 } from 'express-oauth2-jwt-bearer'

const oauth2Middleware = oauth2({
    issuerBaseURL: config.auth.connection.issuerUrl,
    audience: config.auth.connection.audience,
    jwksUri: config.auth.connection.jwksUri
})

const { getUserByUsername } = auth

const localAuthentication = (requiredScopes: string[] = []) => {
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
        next(req, res)
    }
}


export const remoteAuthentication = (requiredScopes: string[] = []): RequestHandler => {
    return (req, res, next) => {
        oauth2Middleware(req, res, (err) => {
            if (err) return next(err);

            const checker = claimCheck((claims) => {
                const roles = (claims.realm_access as any)?.roles || [];
                const passed = requiredScopes.every(scope => roles.includes(scope));
                return passed;
            });

            checker(req, res, (err) => {
                if (err) return next({ statusCode: 403, message: "Forbidden." });

                if (req.auth) {
                    const { payload } = req.auth;
                    req.user = { id: payload.customerId as string };
                }

                next();
            });
        });
    };
};

export const requiresAuthentication = config.auth.useLocal ? localAuthentication : remoteAuthentication;