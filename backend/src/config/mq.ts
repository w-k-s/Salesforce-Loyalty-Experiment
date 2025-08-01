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
        },
        ISSUE_RAFFLE_TICKETS: {
            name: 'issue-raffle-tickets',
            options: {
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: {
                    'x-message-ttl': 1800000, // 30 minutes
                    'x-max-length': 10000,
                    'x-dead-letter-exchange': 'dlx.issue-raffle-tickets',
                    'x-dead-letter-routing-key': 'failed.issue-raffle-tickets'
                },
            },
            bindings: [
                {
                    exchange: 'transactions.exchange',
                    routingKey: 'transaction.processed'
                }
            ]
        }
    },
    exchanges: {
        TRANSACTIONS: {
            name: 'transactions.exchange',
            type: 'topic',
            options: {
                durable: true,
                autoDelete: false
            }
        }
    }
} as RabbitMQConfig;