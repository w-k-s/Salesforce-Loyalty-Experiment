import {
    type Sqlite3Connection,
    type PgConnection,
    type DatabaseConfig,
    type DatabaseConnection
} from './types.js';

const useInMemory = process.env.USE_IN_MEMORY_DB === 'true' || !process.env.USE_IN_MEMORY_DB;

const sqliteConnection: Sqlite3Connection = {
    filename: process.env.SQLITE3_FILENAME || ':memory:'
};

const pgConnection: PgConnection = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'loyalty',
};

const dbConnection: DatabaseConnection = {
    client: useInMemory ? 'sqlite3' : 'pg',
    connection: useInMemory ? sqliteConnection : pgConnection,
};

export default {
    connection: dbConnection,
} as DatabaseConfig;