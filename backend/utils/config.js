import dotenv from 'dotenv';
import { salesforceLogin } from './salesforce.js';

dotenv.config();

const SALESFORCE_USERNAME = process.env.SALESFORCE_USERNAME
const SALESFORCE_PASSWORD = process.env.SALESFORCE_PASSWORD
const SALESFORCE_TOKEN = process.env.SALESFORCE_TOKEN

export const salesforceConnection = await salesforceLogin(
    SALESFORCE_USERNAME, 
    SALESFORCE_PASSWORD, 
    SALESFORCE_TOKEN
)