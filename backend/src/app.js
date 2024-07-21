import express from 'express';
import routes from './routes.js'

import { salesforceConnection, db, authentication, publish, createConsumer } from './utils/config.js'
import bodyParser from 'body-parser';

import TransactionService from './/transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'
import ProductService from './product/product.service.js'
import transactionSubscription from './transactions/transactions.subscription.js'

const app = express()
const port = 3000

app.use(bodyParser.json())

const transactionService = TransactionService({ salesforceConnection, db })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ salesforceConnection, authenticationService })
const productService = ProductService({ salesforceConnection })


routes({
  app,
  transactionService,
  memberService,
  productService
})

transactionSubscription({ salesforceConnection, transactionService, publish, createConsumer })


app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})