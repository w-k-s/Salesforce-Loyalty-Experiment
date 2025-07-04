import { default as config } from './config/index.js';

import express from 'express';
import routes from './routes.js'
import bodyParser from 'body-parser';

import { errorResponse } from './middleware/errors.js';
import { authentication } from './utils/config.js'

import mqService from './mq/index.js';
import db from './db/index.js'

import TransactionService from './transactions/transactions.service.js';
import MemberService from './member/member.service.js';
import AuthenticationService from './auth/auth.service.js'
import { TransactionEmitter as loyaltyTxnEmitter } from './loyalty/index.js';

const { mq } = config;

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(errorResponse)

const transactionService = TransactionService({ loyaltyTxnEmitter })
const authenticationService = AuthenticationService(authentication)
const memberService = MemberService({ authenticationService })

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await db.migrate.latest();
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
}

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
  memberService,
})


app.listen(port, async () => {
  console.log(`Loyalty Backend listening on port ${port}`)
  await runMigrations();
  await initializeRabbitMQ();
  await loyaltyTxnEmitter.initialize();
})

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (loyaltyTxnEmitter) await loyaltyTxnEmitter.shutdown();
  if (mqService) await mqService.close();
  process.exit(0);
});
