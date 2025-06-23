import PubSubApiClient from 'salesforce-pubsub-api-client';
import { EventEmitter } from 'events';

export class TransactionEmitter {
    constructor({
        salesforceConnection,
    }) {
        this._salesforceConnection = salesforceConnection;
        this._emitter = new EventEmitter();
        this._client = new PubSubApiClient();
        this._identity = null;
        this._initialized = false;
    }

    async initialize() {
        if (!this._initialized) {
            this._identity = await this._salesforceConnection.identity();
            await this._client.connectWithAuth(this._salesforceConnection.accessToken, this._salesforceConnection.instanceUrl, identity.organization_id);

            this._salesforceEventEmitter = await this._client.subscribe(
                '/data/OrderChangeEvent'
            );
            this._salesforceEventEmitter.on('data', this._onTransactionEmitted.bind(this))

            this._initialized = true;
        }
        return this;
    }

    _onTransactionEmitted(event) {
        console.log(
            `Handling ${event.payload.ChangeEventHeader.entityName} change event ` +
            `with ID ${event.replayId} ` +
            `on channel ${this._salesforceEventEmitter.getTopicName()} ` +
            `(${this._salesforceEventEmitter.getReceivedEventCount()}/${this._salesforceEventEmitter.getRequestedEventCount()} ` +
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
            this._emitter.emit('create', transaction)
        } else if (changeType === "UPDATE") {
            this._emitter.emit('update', transaction)
        }
    }

    get identity() {
        if (!this._initialized) {
            throw new Error('TransactionEmitter must be initialized before accessing identity');
        }
        return this._identity;
    }

    async shutdown() {
        if (!this._initialized) return;

        try {
            if (this._salesforceEventEmitter) {
                this._salesforceEventEmitter.off('data', this._onTransactionEmitted);
                await this._salesforceEventEmitter.unsubscribe();
                this._salesforceEventEmitter = null;
            }

            await this._client.disconnect();
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