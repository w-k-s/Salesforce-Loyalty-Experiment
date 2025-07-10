// #region Loyalty

export class SalesforceConnection {

    constructor(
        public readonly username: string,
        public readonly password: string,
        public readonly token: string,
        public readonly loginUrl: string
    ) { }

    getPasswordWithToken(): string {
        return `${this.password || ''}${this.token || ''}`;
    }
}

export interface SalesforceDefaults {
    pricebook2Id: string;
    accountId: string;
}

export interface SalesforceConfig {
    connection: SalesforceConnection;
    defaults: SalesforceDefaults
}

// #endregion

// #region RabbitMQ

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

export interface QueueBinding {
    exchange: string
    routingKey: string
}

export interface Queue {
    name: string;
    options: QueueOptions;
    bindings?: QueueBinding[];
}

export interface ExchangeOptions {
    durable: boolean;
    autoDelete: boolean;
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
        ISSUE_RAFFLE_TICKETS: Queue;
    };
    exchanges: {
        TRANSACTIONS: Exchange;
        ORDERS: Exchange;
    };
}

// #endregion

// #region Cache

export interface CacheConnection {
    url: string,
}

export interface CacheConfig {
    connection: CacheConnection,
    useLocal: boolean
}

// #endregion

// #region Database

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

// #endregion

// #region Identity Provider

export interface IdentityProviderConnection {
    authUrl: string
    clientId: string
    clientSecret: string
    tenant: string
    issuerUrl: string
    audience?: string
}

export interface IdentityProviderConfig {
    connection: IdentityProviderConnection
    useLocal: boolean
}
