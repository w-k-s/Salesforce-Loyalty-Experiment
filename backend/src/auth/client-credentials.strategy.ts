import util from 'util'
import passport from 'passport-strategy'
import jwksClient from 'jwks-rsa'
import jwt from 'jsonwebtoken'

const NAME = 'keycloak-validate-token'

/**
 * 
 * @param {Object} options options object
 * @param {string} options.jwksUri Open ID Certs Endpoint
 */
export function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('OAuth 2.0 client password strategy requires a verify function');
    if (!options.jwksUri) throw new Error("options.jwksUri url is required")

    passport.Strategy.call(this);
    this.name = NAME
    this.options = options;
    this._verify = verify;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on client credentials in the request body.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = async function (req) {
    const authorization = req.headers.authorization
    if (!authorization) {
        console.log("Authorization header not found")
        return this.fail();
    }

    try {

        var client = jwksClient({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 600000, // 10m
            jwksUri: this.options.jwksUri
        });

        function getKey(header, callback) {
            client.getSigningKey(header.kid, function (err, key) {
                if (err) {
                    console.log(`Failed to retrieve key with id '${header.kid}'`)
                    callback(err, null);
                } else {
                    var signingKey = undefined //key.publicKey || key.rsaPublicKey;
                    callback(null, signingKey);
                }

            });
        }

        const self = this;
        function verified(err, client, info) {
            if (err) { return self.error(err); }
            if (!client) { return self.fail(); }
            self.success(client, info);
        }

        const [_, token] = authorization.split(" ")
        jwt.verify(token, getKey, function (err, decoded) {
            console.log({ decoded })
            self._verify(decoded, verified);
        })

    } catch (e) {
        console.log(e)
    }
}
