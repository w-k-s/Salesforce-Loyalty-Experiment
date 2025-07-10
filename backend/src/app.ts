import config from './config/index.js';

import express from 'express';
import routes from './routes.js'
import bodyParser from 'body-parser';

import mqService from './mq/index.js';
import db from './db/index.js'

import { processOutOfOrderTransaction, onTransactionCreated, onTransactionUpdated } from './transactions/service.js';
import { issueRaffleTickets } from './raffles/service.js';
import { TransactionEmitter as loyaltyTxnEmitter } from './loyalty/index.js';

const { mq } = config;

const app = express()
const port = 3000

app.use(bodyParser.json())
routes(app)

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
      processOutOfOrderTransaction,
      {
        prefetch: 1,
        maxRetries: 3
      }
    );

    await mqService.consume(
      mq.queues.ISSUE_RAFFLE_TICKETS.name,
      issueRaffleTickets,
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

loyaltyTxnEmitter.on('create', onTransactionCreated);
loyaltyTxnEmitter.on('update', onTransactionUpdated);

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
