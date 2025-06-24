import { authentication, cacheSet, cacheGet } from "../utils/config.js";
import passport from "passport";
import { Issuer } from "openid-client"
import { Strategy } from '../auth/client-credentials.strategy.js'

const issuer = await Issuer.discover(authentication.issuerUrl)
passport.use('oauth2', new Strategy({
    jwksUri: issuer.jwks_uri,
    cacheSet,
    cacheGet,
}, (userInfo, done) => {
    console.log('oauth2', userInfo);
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


