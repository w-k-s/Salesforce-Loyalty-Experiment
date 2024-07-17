import passport from "passport";
import { Strategy, Issuer } from 'openid-client'

export const getConfiguredPassport = async () => {

    const keycloakIssuer = await Issuer.discover('http://localhost:8080/realms/loyalty')
    // Part 3a, discover Curity Server metadata and configure the OIDC client
    // client_id and client_secret can be what ever you want
    // may be worth setting them up as env vars 
    const client = new keycloakIssuer.Client({
        client_id: 'loyalty-client',
        client_secret: 'long_secret-here',
        redirect_uris: ['http://localhost:3000/auth/callback'],
        post_logout_redirect_uris: ['http://localhost:3000/logout/callback'],
        response_types: ['code'],
    });

    // Part 3b, configure the passport strategy
    passport.use('oidc', new Strategy({ client }, (tokenSet, userinfo, done) => {
        return done(null, tokenSet.claims());
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