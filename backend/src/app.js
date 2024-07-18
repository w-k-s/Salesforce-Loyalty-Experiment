import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db, authentication } from './utils/config.js'
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { getConfiguredPassport } from './auth/passport.js'

import TransactionService from './/transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'

const app = express()
const port = 3000

app.use(bodyParser.json())

const memoryStore = new expressSession.MemoryStore();
const session = {
  secret: "someSecret",
  resave: false,
  saveUninitialized: false,
  store: memoryStore
};

app.use(expressSession(session));

const passport = await getConfiguredPassport();
app.use(passport.initialize());
app.use(passport.session());

const transactionService = TransactionService({ salesforceConnection, db })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ salesforceConnection, authenticationService })

routes({
  app,
  transactionService,
  memberService,
  passport
})
subscriptions({ salesforceConnection, transactionService })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})