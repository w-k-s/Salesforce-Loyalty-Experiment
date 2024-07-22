import PubSubApiClient from 'salesforce-pubsub-api-client';

export default async ({ salesforceConnection, transactionService, publish, createConsumer }) => {

    const OUT_OF_ORDER_TRANSACTIONS_QUEUE = 'ooo-transactions'
    const { onTransactionCreated, onTransactionUpdated } = transactionService

    try {
        const identity = await salesforceConnection.identity()
        const client = new PubSubApiClient();
        await client.connectWithAuth(salesforceConnection.accessToken, salesforceConnection.instanceUrl, identity.organization_id);

        const outOfOrderTransactionUpdatesEmitter = createConsumer(OUT_OF_ORDER_TRANSACTIONS_QUEUE, { durable: true })

        // Subscribe to account change events
        const salesforceEventEmitter = await client.subscribe(
            '/data/OrderChangeEvent'
        );

        // Handle incoming events
        salesforceEventEmitter.on('data', async (event) => {
            console.log(
                `Handling ${event.payload.ChangeEventHeader.entityName} change event ` +
                `with ID ${event.replayId} ` +
                `on channel ${salesforceEventEmitter.getTopicName()} ` +
                `(${salesforceEventEmitter.getReceivedEventCount()}/${salesforceEventEmitter.getRequestedEventCount()} ` +
                `events received so far)`
            );

            const { payload } = event
            const { ChangeEventHeader: { changeType } } = payload
            const transaction = {
                id: payload.ChangeEventHeader.recordIds[0],
                orderNumber: payload.OrderNumber,
                description: payload.Description,
                totalAmount: payload.TotalAmount,
                effectiveDate: new Date(payload.EffectiveDate),
                customerId: payload.BillToContactId,
                status: payload.Status,
                createdDate: new Date(payload.CreatedDate),
                modifiedDate: new Date(payload.LastModifiedDate)
            }

            console.log(`${changeType} Transaction ${transaction.id}: '${JSON.stringify(transaction, null, 2)}'`)
            if (changeType === "CREATE") {
                await onTransactionCreated(transaction)
            } else if (changeType === "UPDATE") {
                publish(transaction, OUT_OF_ORDER_TRANSACTIONS_QUEUE, { durable: true })
            }
        });


        outOfOrderTransactionUpdatesEmitter.on('data', (payload, ack, nack) => {
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
    } catch (error) {
        console.error(error);
    }
}  