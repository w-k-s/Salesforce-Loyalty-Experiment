
import { default as salesforceConfig } from './salesforce.js';
import { default as rabbitMQConfig } from './mq.js';
import { default as cacheConfig } from './cache.js';

export default {
    salesforce: salesforceConfig,
    mq: rabbitMQConfig,
    cache: cacheConfig
};