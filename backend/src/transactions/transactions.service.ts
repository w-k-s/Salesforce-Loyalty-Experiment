import db from '../db/index.js'
import * as repo from './transactions.data.js'
import mqService from '../mq/index.js'
import config from '../config/index.js'
import { Transaction } from '../loyalty/types.js';

const { mq } = config

export const onTransactionCreated = async (transaction: Transaction) => {
    await repo.saveTransaction(transaction);
    await onTransactionSaved(transaction)
}

export const onTransactionUpdated = async (transaction: Transaction) => {
    await mqService.publishToQueue(
        mq.queues.OUT_OF_ORDER_TXNS.name,
        transaction
    );
}

export const processOutOfOrderTransaction = async (messageContent, msg) => {
    try {
        console.log(`Processing out-of-order transaction: ${messageContent.id}`);

        const result = await updateTransaction(messageContent)
        if (result === 'NOT_FOUND') {
            // Throw error to trigger retry mechanism
            console.log(`Update not processed: ${messageContent.id}`);
            throw new Error(`Transaction update not processed: ${messageContent.id}`);
        } else if (result === "STALE") {
            console.log("Transaction stale.")
        } else {
            console.log(`Update processed: ${result.id}`);
            await onTransactionSaved(result)
        }

    } catch (error) {
        console.log(`Failed to process out-of-order transaction ${messageContent.id}:`, error);
        // Re-throw to let mqService handle retries and dead letter queue
        throw error;
    }
}

const updateTransaction = async (event: Transaction): Promise<Transaction | 'NOT_FOUND' | 'STALE'> => {
    console.log(`updateTransaction: Event Received`, JSON.stringify(event))

    return db.transaction(async (trx) => {
        const result = await repo.findTransactionById(event.id)
        if (result === 'NOT_FOUND') {
            return result
        }

        const isStale = result.modifiedDate > event.modifiedDate
        if (isStale) {
            return 'STALE'
        }

        result.totalAmount = event.totalAmount
        result.modifiedDate = event.modifiedDate

        await repo.updateTransaction(result, trx)
        return result
    })
}

const onTransactionSaved = async (transaction: Transaction) => {
    const pointsToAward = BigInt(transaction.totalAmount) / BigInt(10)
    const risk = assessRisk(transaction.customerId, pointsToAward, transaction.createdDate)
    if (risk === 'high') {
        // raise case of suspicious transaction
    } else {
        await mqService.publishToExchange(
            mq.exchanges.TRANSACTIONS.name,
            'transaction.processed',
            transaction,
        );
    }
}

const assessRisk = (customerId, points, date): string => {
    //TODO
    return 'low'
}