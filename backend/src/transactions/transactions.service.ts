import { saveTransaction, updateTransaction, findTransactionById } from './transactions.data.js'
import { issueRaffleTickets } from '../raffles/raffle.service.js';
import mqService from '../mq/index.js'
import { default as config } from '../config/index.js'

const { mq } = config

export const onTransactionCreated = async (transaction) => {
    await saveTransaction(transaction);
    issueRaffleTickets(transaction);
}

export const onTransactionUpdated = async (transaction) => {
    await mqService.publishToQueue(
        mq.queues.OUT_OF_ORDER_TXNS.name,
        transaction
    );
}

export const processTransaction = async (messageContent, msg) => {
    try {
        console.log(`Processing out-of-order transaction: ${messageContent.id}`);

        if (await processOutOfOrderTransaction(messageContent)) {
            // Update processed successfully
            console.log(`Update processed: ${messageContent.id}`);
            // Message will be automatically acknowledged by the mqService
        } else {
            // Update stale or transaction create event not received
            console.log(`Update not processed: ${messageContent.id}`);
            // Throw error to trigger retry mechanism
            throw new Error(`Transaction update not processed: ${messageContent.id}`);
        }
    } catch (error) {
        console.log(`Failed to process out-of-order transaction ${messageContent.id}:`, error);
        // Re-throw to let mqService handle retries and dead letter queue
        throw error;
    }
}

const processOutOfOrderTransaction = async (event) => {
    const updated = await updateTransaction(event, (oldTransaction) => {
        return oldTransaction.modifiedDate < event.modifiedDate
    })

    if (updated) {
        // An additional query is required because the event doesn't have most of the data.
        const transaction = await findTransactionById(event.id)
        issueRaffleTickets(transaction);
    }

    return updated
}