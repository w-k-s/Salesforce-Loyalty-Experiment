import PubSubApiClient from 'salesforce-pubsub-api-client';

export default async ({ transactionService }) => {

    const { onTransactionCreated, onTransactionUpdated } = transactionService

    try {
        const identity = await salesforceConnection.identity()
        const client = new PubSubApiClient();
        await client.connectWithAuth(salesforceConnection.accessToken, salesforceConnection.instanceUrl, identity.organization_id);

        // Subscribe to account change events
        const eventEmitter = await client.subscribe(
            '/data/OrderChangeEvent'
        );

        // Handle incoming events
        eventEmitter.on('data', async (event) => {
            console.log(
                `Handling ${event.payload.ChangeEventHeader.entityName} change event ` +
                `with ID ${event.replayId} ` +
                `on channel ${eventEmitter.getTopicName()} ` +
                `(${eventEmitter.getReceivedEventCount()}/${eventEmitter.getRequestedEventCount()} ` +
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

            // TODO: Update usually comes before create. Will fix later.
            console.log(`${changeType} Transaction ${transaction.id}: '${JSON.stringify(transaction, null, 2)}'`)
            if (changeType === "CREATE") {
                await onTransactionCreated(transaction)
            } else if (changeType === "UPDATE") {
                await onTransactionUpdated(transaction)
            }
        });
    } catch (error) {
        console.error(error);
    }
}  