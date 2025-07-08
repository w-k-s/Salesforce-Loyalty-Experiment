import dotenv from 'dotenv';
dotenv.config();

import { SalesforceConnection, SalesforceConfig, SalesforceDefaults } from './types.js';

export default {
    connection: new SalesforceConnection(
        process.env.SALESFORCE_USERNAME!!,
        process.env.SALESFORCE_PASSWORD!!,
        process.env.SALESFORCE_TOKEN!!,
        process.env.SALESFORCE_AUTH_URL || 'https://login.salesforce.com'
    ),
    defaults: {
        pricebook2Id: process.env.SALESFORCE_PRICEBOOK2_ID,
        accountId: process.env.SALESFORCE_ACCOUNT_ID
    } as SalesforceDefaults
} as SalesforceConfig;