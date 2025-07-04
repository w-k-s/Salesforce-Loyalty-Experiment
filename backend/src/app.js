import express from 'express';
import routes from './routes.js'
import { errorResponse } from './middleware/errors.js';

import { salesforceConnection, db, authentication, cacheSet, cacheGet } from './utils/config.js'
import bodyParser from 'body-parser';

import TransactionService from './transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'
import { TransactionEmitter, default as LoyaltyService } from './loyalty/index.js';
import { config } from './config/mq.js';
import mqService from './mq/mq.js';

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(errorResponse)

const loyaltyTxnEmitter = new TransactionEmitter({ salesforceConnection });
await loyaltyTxnEmitter.initialize();

const loyalty = LoyaltyService({ salesforceConnection })

const transactionService = TransactionService({ loyaltyTxnEmitter, db })
const authenticationService = AuthenticationService(authentication, cacheSet, cacheGet)
const memberService = MemberService({ loyalty, authenticationService, cacheSet, cacheGet })

async function initializeRabbitMQ() {
  try {
    await mqService.connect();

    await mqService.consume(
      config.queues.OUT_OF_ORDER_TXNS.name,
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
  transactionService,
  memberService,
})


app.listen(port, async () => {
  console.log(`Loyalty Backend listening on port ${port}`)
  await initializeRabbitMQ();
})

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (loyaltyTxnEmitter) await loyaltyTxnEmitter.shutdown();
  if (mqService) await mqService.close();
  process.exit(0);
});
