import Joi from 'joi';

export const validate = (schema) => {
    return (req, res, next) => {
        const { error, _ } = schema.validate(req.body);
        if (error) {
            console.log('error', error)
            return res.status(400).send({
                result: error.details[0].message
            });
        }
        next()
    }
}

export const checkAuthenticated = (req, res, next) => {
    console.log(`isAuthenticated: ${req.isAuthenticated()}`)
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/auth/login")
}

export const checkOwner = ({ userIdProvider, resourceOwnerIdProvider }) => {

    return (req, res, next) => {
        if (!req.user) {
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

// This bothers me, passport is like a leaky abstraction entangled everywhere
export const hasScope = (passport, scope) => {
    return (req, res, next) => {
        passport.authenticate('m2m', (err, user, info) => {
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

            req.login(user, next);
        })(req, res, next);
    }
}