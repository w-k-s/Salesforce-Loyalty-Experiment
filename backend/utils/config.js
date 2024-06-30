import dotenv from 'dotenv';
dotenv.config();

export const SALESFORCE_USERNAME = process.env.SF_USERNAME
export const SALESFORCE_PASSWORD = process.env.SF_PASSWORD
export const SALESFORCE_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN