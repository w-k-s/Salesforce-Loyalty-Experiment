import PubSubApiClient from 'salesforce-pubsub-api-client';
import transactionService from './transactions/transactions.service.js';


export default async ({ salesforceConnection, db }) => {

    const { onTransactionCreated, onTransactionUpdated } = transactionService({ salesforceConnection, db })

    try {
        const identity = await salesforceConnection.identity()
        const client = new PubSubApiClient();
        await client.connectWithAuth(salesforceConnection.accessToken, salesforceConnection.instanceUrl, identity.organization_id);

        // Subscribe to account change events
        const eventEmitter = await client.subscribe(
            '/data/OrderChangeEvent'
        );

        // Handle incoming events
        eventEmitter.on('data', (event) => {
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
                createdDate: payload.CreatedDate,
                effectiveDate: payload.EffectiveDate,
                contactId: payload.BillToContactId,
                status: payload.Status
            }

            if (changeType === "CREATE") {
                onTransactionCreated(transaction)
            } else if (changeType === "UPDATE") {
                onTransactionUpdated(transaction)
            }
        });
    } catch (error) {
        console.error(error);
    }
}  