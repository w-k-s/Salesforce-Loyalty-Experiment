import { authentication } from "../utils/config.js";
import passport from "passport";
import { Issuer } from "openid-client"
import { Strategy } from '../auth/client-credentials.strategy.js'

const issuer = await Issuer.discover(authentication.issuerUrl)
passport.use('oauth2', new Strategy({
    userInfoURL: issuer.userinfo_endpoint,
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
            if (!user || !user.realm_access) {
                if (user) {
                    console.log(`${user.preferred_username} has no roles`)
                } else {
                    console.log('Not authenticated')
                }

                return res.status(401).send({ "error": "Unauthorized" })
            }

            const { realm_access: { roles } } = user

            if (!roles) {
                return res.status(401).send({ "error": "Unauthorized" })
            }

            if (!roles.includes(scope)) {
                console.log(`${user.preferred_username} does not have scope ${scope}`)
                return res.status(401).send({ "error": "Unauthorized" })
            }

            req.login(user, { session: false }, next);
        })(req, res, next);
    }
}

export const checkOwner = ({ userIdProvider, resourceOwnerIdProvider }) => {

    return (req, res, next) => {
        if (!req.user) {
            console.log("Session not created")
            return res.status(401).send({ "error": "Unauthorized" })
        }
        const userId = userIdProvider(req.user)
        const resourceOwnerId = resourceOwnerIdProvider(req)
        if (userId != resourceOwnerId) {
            console.log(`user with id ${userId} can't access resource belonging to ${resourceOwnerId}`)
            return res.status(403).send({ "error": "Forbidden" })
        }

        console.log(`user with id ${userId} accessing resource belonging to ${resourceOwnerId}`)
        next()
    }
}

