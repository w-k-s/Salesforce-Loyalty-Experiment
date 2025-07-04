
import { default as salesforceConfig } from './salesforce.js';
import { default as rabbitMQConfig } from './mq.js';
import { default as dbConfig } from './db.js';
import { default as cacheConfig } from './cache.js';
export * from './types.js';

export default {
    salesforce: salesforceConfig,
    mq: rabbitMQConfig,
    db: dbConfig,
    cache: cacheConfig
};