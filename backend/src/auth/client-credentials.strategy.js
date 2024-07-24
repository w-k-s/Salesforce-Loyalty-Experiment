import util from 'util'
import passport from 'passport-strategy'

const NAME = 'keycloak-validate-token'

/**
 * 
 * @param {Object} options options object
 * @param {string} options.userInfoURL UserInfo URL
 * @param {(key, value,{timeToLiveSeconds}) => void} options.cacheSet Caches the value in a distributed cache using the given name
 * @param {(key) => value} options.cacheGet Retrieves the value from the distributed cache using the given key
 */
export function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('OAuth 2.0 client password strategy requires a verify function');
    if (!options.userInfoURL) throw new Error("options.userInfoURL url is required")

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

    console.log(`Calling '${this.options.userInfoURL}'`)
    // This is the lazy unscalable approach (calling the userinfo url). Once we have the cache, we'll use that to store the jws and validate jwts locally.
    // See: https://www.keycloak.org/docs/25.0.2/securing_apps/#validating-access-tokens
    try {
        const response = await fetch(this.options.userInfoURL, {
            headers: {
                Authorization: authorization
            }
        })

        if (!response.ok) {
            let hint = ""
            if (response.status == 403) {
                hint = " A 403 code might be because the token was requested without explictly requesting the `openid` scope."
            }
            console.log(`Token validation failed with status '${response.statusText}'.${hint}`)
            return this.fail();
        }

        const userInfo = await response.json()
        const self = this;
        function verified(err, client, info) {
            if (err) { return self.error(err); }
            if (!client) { return self.fail(); }
            self.success(client, info);
        }

        this._verify(userInfo, verified);
    } catch (e) {
        console.log(e)
    }
}
