import transactionDao from './transactions.data.js'
import raffleService from '../raffles/raffle.service.js';

export default ({ loyaltyTxnEmitter, db, outOfOrderQueue }) => {
    const { saveTransaction, updateTransaction, findTransactionById } = transactionDao(db)
    const { issueRaffleTickets } = raffleService(db)

    loyaltyTxnEmitter.on('create', async (transaction) => {
        await saveTransaction(transaction);
        issueRaffleTickets(transaction);
    });

    loyaltyTxnEmitter.on('update', async (transaction) => {
        await outOfOrderQueue.publish(transaction)
    })

    outOfOrderQueue.consumer.on('data', (payload, ack, nack) => {
        try {
            if (onTransactionUpdated(payload)) {
                // update processed
                console.log(`Update processed: ${payload.id}`)
                ack()
            } else {
                // update stale of transaction create event not received
                console.log(`Update not processed: ${payload.id}`)
                nack()
            }
        } catch (e) {
            console.log(`Failed to process out-of-order transaction ${payload}.`, e)
            nack()
        }
    })


    const onTransactionUpdated = async (event) => {
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

}