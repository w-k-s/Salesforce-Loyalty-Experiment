import dotenv from 'dotenv';
import { salesforceLogin, createSalesforcePubSubClient } from './salesforce.js';

dotenv.config();

const SALESFORCE_USERNAME = process.env.SF_USERNAME
const SALESFORCE_PASSWORD = process.env.SF_PASSWORD
const SALESFORCE_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN

export const salesforceConnection = await salesforceLogin(
    SALESFORCE_USERNAME, 
    SALESFORCE_PASSWORD, 
    SALESFORCE_SECURITY_TOKEN
)

export const salesforcePubSubClient = await createSalesforcePubSubClient(
    salesforceConnection,
    'sf.proto'
)