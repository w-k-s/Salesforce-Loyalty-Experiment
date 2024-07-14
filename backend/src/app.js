import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db, authentication } from './utils/config.js'
import bodyParser from 'body-parser';
import { Issuer, Strategy } from 'openid-client'
import passport from 'passport';
import expressSession from 'express-session';

import TransactionService from './/transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'

const app = express()
const port = 3000

app.use(bodyParser.json())

// use the issuer url here
const keycloakIssuer = await Issuer.discover('http://localhost:8080/realms/loyalty')
// don't think I should be console.logging this but its only a demo app
// nothing bad ever happens from following the docs :)
console.log('Discovered issuer %s %O', keycloakIssuer.issuer, keycloakIssuer.metadata);

// client_id and client_secret can be what ever you want
// may be worth setting them up as env vars 
const client = new keycloakIssuer.Client({
  client_id: 'loyalty-client',
  client_secret: 'long_secret-here',
  redirect_uris: ['http://localhost:3000/auth/callback'],
  post_logout_redirect_uris: ['http://localhost:3000/logout/callback'],
  response_types: ['code'],
});

var memoryStore = new expressSession.MemoryStore();
app.use(
  expressSession({
    secret: 'another_long_secret',
    resave: true,
    saveUninitialized: true,
    store: memoryStore
  })
);

app.use(passport.initialize());
app.use(passport.session());

// this creates the strategy
passport.use('oidc', new Strategy({ client }, (tokenSet, userinfo, done) => {
  return done(null, tokenSet.claims());
})
)

passport.serializeUser(function (user, done) {
  console.log('Serializing')
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  console.log('DeSerializing')
  done(null, user);
});

// default protected route /test
app.get('/test', (req, res, next) => {
  passport.authenticate('oidc')(req, res, next);
});

// callback always routes to test 
app.get('/auth/callback', (req, res, next) => {
  passport.authenticate('oidc')(req, res, next);
});

// start logout request
app.get('/logout', (req, res) => {
  res.redirect(client.endSessionUrl());
});

// logout callback
app.get('/logout/callback', (req, res) => {
  // clears the persisted user from the local storage
  req.logout();
  // redirects the user to a public route
  res.redirect('/');
});

var checkAuthenticated = (req, res, next) => {
  console.log(`isauthenticated: ${req.isAuthenticated()}`)
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/test")
}

const transactionService = TransactionService({ salesforceConnection, db })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ salesforceConnection, authenticationService })

routes({
  app,
  transactionService,
  memberService,
  checkAuthenticated,
})
subscriptions({ salesforceConnection, transactionService })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})