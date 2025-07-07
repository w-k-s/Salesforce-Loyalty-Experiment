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
 * @param {Object} req - The HTTP request object.
 * @api protected
 * 
 * Sample decoded JWT payload:
 * 
 * ```json
 * {
 *   "exp": 1751916702,
 *   "iat": 1751916402,
 *   "jti": "235fcdfa-35d2-4426-93cb-56a56da52ec2",
 *   "iss": "http://localhost:8080/realms/loyalty",
 *   "aud": "account",
 *   "sub": "8b6a99f5-ae78-4be6-9a0e-ef53cc414083",
 *   "typ": "Bearer",
 *   "azp": "loyalty-client",
 *   "sid": "55648008-11fc-4122-868a-d95171a15da4",
 *   "acr": "1",
 *   "allowed-origins": [
 *     "http://localhost:3000"
 *   ],
 *   "realm_access": {
 *     "roles": [
 *       "offline_access",
 *       "loyalty-member",
 *       "default-roles-loyalty",
 *       "uma_authorization",
 *       "view-profile"
 *     ]
 *   },
 *   "resource_access": {
 *     "account": {
 *       "roles": [
 *         "manage-account",
 *         "manage-account-links",
 *         "view-profile"
 *       ]
 *     }
 *   },
 *   "scope": "profile email",
 *   "email_verified": true,
 *   "name": "John Doe",
 *   "customerId": "003gL00000721XAQAY",
 *   "preferred_username": "john20250707190156@doe.com",
 *   "given_name": "John",
 *   "family_name": "Doe",
 *   "email": "john20250707190156@doe.com"
 * }
 * ```
 */
Strategy.prototype.authenticate = async function (req) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        console.log("Authorization header not found");
        return this.fail();
    }

    try {
        const client = jwksClient({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 600000, // 10 minutes
            jwksUri: this.options.jwksUri,
        });

        function getKey(header, callback) {
            client.getSigningKey(header.kid, function (err, key: any) {
                if (err) {
                    console.log(`Failed to retrieve key with id '${header.kid}'`);
                    return callback(err, null);
                }
                const signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            });
        }

        const self = this;
        function verified(err, client, info) {
            if (err) return self.error(err);
            if (!client) return self.fail();
            self.success(client, info);
        }

        const [, token] = authorization.split(" ");

        jwt.verify(token, getKey, function (err, decoded) {
            console.log(JSON.stringify(decoded));
            self._verify(decoded, verified);
        });
    } catch (e) {
        console.log(e);
    }
};
