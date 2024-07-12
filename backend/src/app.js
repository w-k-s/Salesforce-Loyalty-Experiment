import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db, authentication } from './utils/config.js'
import bodyParser from 'body-parser';
import { auth } from 'express-openid-connect'

import TransactionService from './transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'

const transactionService = TransactionService({ salesforceConnection, db })
const memberService = MemberService({ salesforceConnection, authenticationService })
const authenticationService = AuthenticationService(authentication)

const app = express()
const port = 3000

// Configure session
app.set('trust proxy', true)
app.use(
  auth({
    issuerBaseURL: 'http://localhost:8080/realms/loyalty',
    baseURL: 'http://localhost:3000',
    clientID: 'account-console',
    secret: 'LONG_RANDOM_STRING'
  })
);

app.use(bodyParser.json())

routes({
  app,
  transactionService,
  memberService,
})
subscriptions({ transactionService })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})