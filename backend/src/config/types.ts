export class SalesforceConnection {

    constructor(
        public readonly username: string | undefined,
        public readonly password: string | undefined,
        public readonly token: string | undefined,
        public readonly loginUrl: string | undefined
    ) { }

    getPasswordWithToken(): string {
        return `${this.password || ''}${this.token || ''}`;
    }
}

export interface SalesforceDefaults {
    pricebook2Id: string | undefined;
    accountId: string | undefined;
}

export interface SalesforceConfig {
    connection: SalesforceConnection;
    defaults: SalesforceDefaults
}

export interface RabbitMQConnection {
    protocol: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
    vhost: string;
    heartbeat: number;
}

export interface QueueOptions {
    durable: boolean;
    exclusive: boolean;
    autoDelete: boolean;
    arguments: {
        'x-message-ttl'?: number;
        'x-max-length'?: number;
        'x-dead-letter-exchange'?: string;
        'x-dead-letter-routing-key'?: string;
    };
}

export interface Queue {
    name: string;
    options: QueueOptions;
}

export interface ExchangeOptions {
    durable: boolean;
}

export interface Exchange {
    name: string;
    type: 'topic' | 'direct' | 'fanout' | 'headers';
    options: ExchangeOptions;
}

export interface RabbitMQConfig {
    connection: RabbitMQConnection;
    queues: {
        OUT_OF_ORDER_TXNS: Queue;
    };
    exchanges: {
        NOTIFICATIONS: Exchange;
        ORDERS: Exchange;
    };
}

export interface CacheConnection {
    url: string,
}

export interface CacheConfig {
    connection: CacheConnection,
    useLocal: boolean
}

export interface Sqlite3Connection {
    filename: string
}

export interface PgConnection {
    host: string
    port: number
    user: string
    password: string
    database: string
}

export interface DatabaseConnection {
    client: 'sqlite3' | 'pg',
    connection: Sqlite3Connection | PgConnection
}

export interface DatabaseConfig {
    connection: DatabaseConnection
}