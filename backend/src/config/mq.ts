import { RabbitMQConfig } from './types'

export default {
    connection: {
        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOST || 'localhost',
        port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASS || 'guest',
        vhost: process.env.RABBITMQ_VHOST || '/',
        heartbeat: 60
    },
    queues: {
        OUT_OF_ORDER_TXNS: {
            name: 'out-of-order-transactions',
            options: {
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: {
                    'x-message-ttl': 1800000, // 30 minutes
                    'x-max-length': 10000,
                    'x-dead-letter-exchange': 'dlx.transactions',
                    'x-dead-letter-routing-key': 'failed.transactions'
                }
            }
        }
    },
    exchanges: {
        NOTIFICATIONS: {
            name: 'notifications.exchange',
            type: 'topic',
            options: {
                durable: true
            }
        },
        ORDERS: {
            name: 'orders.exchange',
            type: 'direct',
            options: {
                durable: true
            }
        }
    }
} as RabbitMQConfig;