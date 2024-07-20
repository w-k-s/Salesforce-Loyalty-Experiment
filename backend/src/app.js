import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db, authentication } from './utils/config.js'
import bodyParser from 'body-parser';

import TransactionService from './/transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'

const app = express()
const port = 3000

app.use(bodyParser.json())

const transactionService = TransactionService({ salesforceConnection, db })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ salesforceConnection, authenticationService })

routes({
  app,
  transactionService,
  memberService
})
subscriptions({ salesforceConnection, transactionService })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})