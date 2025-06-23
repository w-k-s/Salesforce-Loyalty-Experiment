import express from 'express';
import routes from './routes.js'
import { errorResponse } from './middleware/errors.js';

import { salesforceConnection, db, authentication, publish, createConsumer, cacheSet, cacheGet } from './utils/config.js'
import bodyParser from 'body-parser';

import loyalty from './loyalty/index.js'
import TransactionService from './transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'
import { TransactionEmitter, default as Loyalty } from './loyalty/index.js';

const OUT_OF_ORDER_TRANSACTIONS_QUEUE = 'ooo-transactions'

const app = express()
const port = 3000

app.use(bodyParser.json())

const loyaltyTxnEmitter = new TransactionEmitter(salesforceConnection);
await loyaltyTxnEmitter.initialize();

const outOfOrderQueue = {
  consumer: createConsumer(OUT_OF_ORDER_TRANSACTIONS_QUEUE, { durable: true }),
  produce: async (payload) => {
    await publish(payload, OUT_OF_ORDER_TRANSACTIONS_QUEUE, { durable: true })
  }
}

const loyalty = Loyalty({ salesforceConnection })
const transactionService = TransactionService({ loyaltyTxnEmitter, db, outOfOrderQueue })
const authenticationService = AuthenticationService(authentication, cacheSet, cacheGet)
const memberService = MemberService({ loyalty, authenticationService, cacheSet, cacheGet })


routes({
  app,
  loyalty,
  transactionService,
  memberService,
})

app.use(errorResponse)
app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (loyaltyTxnEmitter) await loyaltyTxnEmitter.shutdown();
  process.exit(0);
});
