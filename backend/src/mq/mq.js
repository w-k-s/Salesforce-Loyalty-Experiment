import amqp from 'amqplib';
import { config } from '../config/mq.js';

class MQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(config.connection);
            this.channel = await this.connection.createChannel();
            this.isConnected = true;

            // Setup connection event listeners
            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                this.isConnected = false;
            });

            this.connection.on('close', () => {
                console.log('RabbitMQ connection closed');
                this.isConnected = false;
                this.reconnect();
            });

            console.log('Connected to RabbitMQ');
            await this.setupInfrastructure();
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            setTimeout(() => this.reconnect(), 5000);
        }
    }

    async reconnect() {
        if (!this.isConnected) {
            console.log('Attempting to reconnect to RabbitMQ...');
            await this.connect();
        }
    }

    async setupInfrastructure() {
        try {
            // Create exchanges only if defined
            if (config.exchanges) {
                for (const [key, exchange] of Object.entries(config.exchanges)) {
                    await this.channel.assertExchange(
                        exchange.name,
                        exchange.type,
                        exchange.options
                    );
                    console.log(`Exchange '${exchange.name}' created/verified`);
                }
            }

            // Create queues
            for (const [key, queue] of Object.entries(config.queues)) {
                await this.channel.assertQueue(queue.name, queue.options);
                console.log(`Queue '${queue.name}' created/verified`);
            }

            // Setup dead letter exchange for failed messages
            await this.channel.assertExchange('dlx.transactions', 'direct', { durable: true });
            await this.channel.assertQueue('failed.transactions', { durable: true });
            await this.channel.bindQueue('failed.transactions', 'dlx.transactions', 'failed.transactions');

            // Optional: Bind queues to exchanges if both exist
            // if (config.exchanges && config.exchanges.NOTIFICATIONS) {
            //     await this.channel.bindQueue(
            //         config.queues.USER_NOTIFICATIONS.name,
            //         config.exchanges.NOTIFICATIONS.name,
            //         'user.*'
            //     );
            // }

        } catch (error) {
            console.error('Failed to setup RabbitMQ infrastructure:', error);
        }
    }

    // Direct queue publishing (no exchange needed)
    async publishToQueue(queueName, message, options = {}) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const enrichedMessage = {
                ...message,
                id: message.id || this.generateMessageId(),
                timestamp: new Date().toISOString(),
                attempts: 0
            };

            const messageBuffer = Buffer.from(JSON.stringify(enrichedMessage));
            const defaultOptions = {
                persistent: true,
                messageId: enrichedMessage.id,
                timestamp: Date.now()
            };

            const publishOptions = { ...defaultOptions, ...options };

            const sent = await this.channel.sendToQueue(
                queueName,
                messageBuffer,
                publishOptions
            );

            if (sent) {
                console.log(`Message published to queue '${queueName}':`, enrichedMessage.id);
                return enrichedMessage.id;
            } else {
                throw new Error('Failed to publish message');
            }
        } catch (error) {
            console.error(`Failed to publish message to queue '${queueName}':`, error);
            throw error;
        }
    }

    // Exchange publishing (for complex routing scenarios)
    async publishToExchange(exchangeName, routingKey, message, options = {}) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const enrichedMessage = {
                ...message,
                id: message.id || this.generateMessageId(),
                timestamp: new Date().toISOString()
            };

            const messageBuffer = Buffer.from(JSON.stringify(enrichedMessage));
            const defaultOptions = {
                persistent: true,
                messageId: enrichedMessage.id,
                timestamp: Date.now()
            };

            const publishOptions = { ...defaultOptions, ...options };

            const sent = this.channel.publish(
                exchangeName,
                routingKey,
                messageBuffer,
                publishOptions
            );

            if (sent) {
                console.log(`Message published to exchange '${exchangeName}' with routing key '${routingKey}':`, enrichedMessage.id);
                return enrichedMessage.id;
            }

            return sent;
        } catch (error) {
            console.error(`Failed to publish message to exchange '${exchangeName}':`, error);
            throw error;
        }
    }

    async consume(queueName, callback, options = {}) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const defaultOptions = {
                noAck: false,
                prefetch: 1,
                maxRetries: 3
            };

            const consumeOptions = { ...defaultOptions, ...options };

            // Set prefetch count
            await this.channel.prefetch(consumeOptions.prefetch);

            await this.channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log(`Received message from queue '${queueName}':`, content.id);

                        // Execute the callback
                        await callback(content, msg);

                        // Acknowledge the message if not auto-ack
                        if (!consumeOptions.noAck) {
                            this.channel.ack(msg);
                            console.log(`Message ${content.id} processed successfully`);
                        }
                    } catch (error) {
                        console.error(`Error processing message from queue '${queueName}':`, error);

                        // Handle retries
                        const retryCount = msg.properties.headers?.['x-retry-count'] || 0;

                        if (retryCount < consumeOptions.maxRetries) {
                            console.log(`Retrying message, attempt ${retryCount + 1}`);

                            const retryOptions = {
                                ...msg.properties,
                                headers: {
                                    ...msg.properties.headers,
                                    'x-retry-count': retryCount + 1
                                }
                            };

                            // Requeue with exponential backoff
                            setTimeout(() => {
                                this.channel.sendToQueue(queueName, msg.content, retryOptions);
                            }, 1000 * Math.pow(2, retryCount));

                            this.channel.ack(msg);
                        } else {
                            // Max retries exceeded, send to dead letter queue
                            console.log(`Message failed after ${consumeOptions.maxRetries} attempts`);
                            this.channel.nack(msg, false, false);
                        }
                    }
                }
            }, { noAck: consumeOptions.noAck });

            console.log(`Started consuming from queue '${queueName}'`);
        } catch (error) {
            console.error(`Failed to consume from queue '${queueName}':`, error);
            throw error;
        }
    }

    async getQueueInfo(queueName) {
        if (!this.isConnected) {
            throw new Error('RabbitMQ not connected');
        }

        try {
            const queueInfo = await this.channel.checkQueue(queueName);
            return {
                queue: queueName,
                messageCount: queueInfo.messageCount,
                consumerCount: queueInfo.consumerCount
            };
        } catch (error) {
            console.error(`Failed to get queue info for '${queueName}':`, error);
            throw error;
        }
    }

    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async close() {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
        this.isConnected = false;
    }
}

export default new MQService();
