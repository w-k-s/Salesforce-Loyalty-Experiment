import PubSubApiClient from 'salesforce-pubsub-api-client';
import { EventEmitter } from 'events';
import { Transaction } from './types.js'
import { type Connection } from 'jsforce';
import { default as salesforceConnection } from './connection.js'

class TransactionEmitter {
    private _emitter: EventEmitter = new EventEmitter();
    private _client: PubSubApiClient | null = null;
    private _initialized: boolean = false

    constructor(
        private readonly _salesforceConnection: Connection
    ) {
    }

    async initialize() {
        if (!this._initialized) {
            this._client = new PubSubApiClient({
                authType: 'user-supplied',
                accessToken: this._salesforceConnection.accessToken!,
                instanceUrl: this._salesforceConnection.instanceUrl,
                organizationId: this._salesforceConnection.userInfo!.organizationId
            });
            await this._client.connect();

            const subscribeCallback = (subscription, callbackType, data) => {
                switch (callbackType) {
                    case 'event':
                        // Event received
                        console.log(
                            `${subscription.topicName} - Handling ${data.payload.ChangeEventHeader.entityName} change event ` +
                            `with ID ${data.replayId} ` +
                            `(${subscription.receivedEventCount}/${subscription.requestedEventCount} ` +
                            `events received so far)`
                        );
                        // Safely log event payload as a JSON string
                        console.log(
                            JSON.stringify(
                                data,
                                (key, value) =>
                                    /* Convert BigInt values into strings and keep other types unchanged */
                                    typeof value === 'bigint'
                                        ? value.toString()
                                        : value,
                                2
                            )
                        );

                        const { payload } = data
                        const { ChangeEventHeader: { changeType } } = payload
                        const transaction: Transaction = {
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
                            this._emitter.emit('create', transaction)
                        } else if (changeType === "UPDATE") {
                            this._emitter.emit('update', transaction)
                        }

                        break;
                    case 'lastEvent':
                        // Last event received
                        console.log(
                            `${subscription.topicName} - Reached last of ${subscription.requestedEventCount} requested event on channel. Closing connection.`
                        );
                        break;
                    case 'end':
                        // Client closed the connection
                        console.log('Client shut down gracefully.');
                        break;
                }
            };

            this._client.subscribe('/data/OrderChangeEvent', subscribeCallback);
            this._initialized = true;
        }
        return this;
    }


    async shutdown() {
        if (!this._initialized) return;

        try {
            if (this._client) { this._client.close(); }
            this._emitter.removeAllListeners();
        } catch (err) {
            console.error('Failed during shutdown of TransactionEmitter:', err);
        } finally {
            this._initialized = false;
        }
    }

    on(event, listener) {
        return this._emitter.on(event, listener);
    }

    removeListener(event, listener) {
        return this._emitter.removeListener(event, listener);
    }
}

export default new TransactionEmitter(salesforceConnection)