import config from "../config/index.js";
import passport from "passport";
import cache from '../cache/index.js'

const { auth } = config

import { Strategy } from '../auth/client-credentials.strategy.js'

// We could use openid-client to cache this 
passport.use('oauth2', new Strategy({
    jwksUri: auth.connection.jwksUri,
}, (userInfo, done) => {
    return done(null, userInfo);
}))

export const requiresAuthentication = (req, res, next) => {

    return passport.authenticate('oauth2', { session: false }, (err, user, info) => {

        if (err) { return next(err); }
        if (!user) {
            return res.status(401).send({ "error": "Unauthorized" })
        }

        req.login(user, { session: false }, next);
    })(req, res, next);
}


export const requiresScope = (scope) => {
    return (req, res, next) => {
        passport.authenticate('oauth2', { session: false }, (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                console.log('Not authenticated')
                return res.status(401).send({ "error": "Unauthorized" })
            }

            let allRoles = []
            if (user.realm_access) {
                const { realm_access: { roles } } = user
                allRoles = [...allRoles, ...roles]
            }


            console.log(allRoles)
            if (!allRoles.includes(scope)) {
                console.log(`${user.preferred_username} does not have scope ${scope}`)
                return res.status(401).send({ "error": "Unauthorized" })
            }

            req.login(user, { session: false }, next);
        })(req, res, next);
    }
}


