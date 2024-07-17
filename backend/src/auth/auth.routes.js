import express from 'express';
import passport from "passport";

export default () => {
    const authRoutes = express.Router()
    authRoutes.get('/login', passport.authenticate('oidc'));
    authRoutes.get('/callback', passport.authenticate('oidc', { failureRedirect: '/login' }), (req, res) => {
        res.redirect('about:blank');
    })
    return authRoutes
}