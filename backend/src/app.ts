import { default as config } from './config/index.js';

import express from 'express';
import routes from './routes.js'
import { errorResponse } from './middleware/errors.js';

import { db, authentication } from './utils/config.js'
import bodyParser from 'body-parser';

import TransactionService from './transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'
import { TransactionEmitter as loyaltyTxnEmitter, default as loyalty } from './loyalty/index.js';

import mqService from './mq/mq.js';

const { mq } = config;

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(errorResponse)

const transactionService = TransactionService({ loyaltyTxnEmitter, db })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ loyalty, authenticationService })

async function initializeRabbitMQ() {
  try {
    await mqService.connect();

    await mqService.consume(
      mq.queues.OUT_OF_ORDER_TXNS.name,
      transactionService.processTransaction.bind(transactionService),
      {
        prefetch: 1,
        maxRetries: 3
      }
    );
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error);
    process.exit(1);
  }
}


routes({
  app,
  loyalty,
  memberService,
})


app.listen(port, async () => {
  console.log(`Loyalty Backend listening on port ${port}`)
  await initializeRabbitMQ();
  await loyaltyTxnEmitter.initialize();
})

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (loyaltyTxnEmitter) await loyaltyTxnEmitter.shutdown();
  if (mqService) await mqService.close();
  process.exit(0);
});
