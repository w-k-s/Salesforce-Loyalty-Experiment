import amqp from "amqplib";
import EventEmitter from 'events'

export class MQService extends EventEmitter {

    constructor(connectionString) {
        super();
        this.connectionString = connectionString;
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.consumers = new Map(); // Track active consumers
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.connectionString);
            this.channel = await this.connection.createChannel();
            this.isConnected = true;

            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                this.isConnected = false;
            });

            this.connection.on('close', () => {
                console.log('RabbitMQ connection closed');
                this.isConnected = false;
            });

            console.log('Connected to RabbitMQ');
            return this.channel;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async consume(queueName, messageHandler, queueParams = { durable: true }) {
        if (!this.isConnected) {
            throw new Error('Not connected to RabbitMQ');
        }

        try {
            await this.channel.assertQueue(queueName, queueParams);

            const consumerTag = await this.channel.consume(queueName, (message) => {
                if (message !== null) {
                    this.handleMessage(message, messageHandler);
                }
            }, {
                noAck: false // Always use manual acknowledgment for reliability
            });

            this.consumers.set(queueName, consumerTag.consumerTag);
            console.log(`Started consuming from queue: ${queueName}`);

        } catch (error) {
            console.error(`Error setting up consumer for ${queueName}:`, error);
            throw error;
        }
    }

    async publish(payload, queueName, queueParams = { durable: false }) {
        if (!this.isConnected) {
            throw new Error('Not connected to RabbitMQ');
        }

        try {
            await this.channel.assertQueue(queueName, queueParams);
            const data = JSON.stringify(payload);
            return this.channel.sendToQueue(queueName, Buffer.from(data));
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    async handleMessage(message, messageHandler) {
        try {
            const contents = JSON.parse(message.content.toString());
            const messageType = contents.type || 'unknown';

            console.log(`Processing ${messageType} message`);

            const ack = () => this.channel.ack(message);
            const nack = () => this.channel.nack(message, false, true); // Requeue on nack

            await messageHandler(messageType, contents.data || contents, ack, nack);

        } catch (parseError) {
            console.error('Error parsing message:', parseError);
            this.channel.nack(message, false, false); // Don't requeue invalid messages
        }
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.consumers.clear()
            this.isConnected = false;
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}
