import dotenv from 'dotenv';
dotenv.config();
import jsforce from 'jsforce';
import { v4 as uuidv4 } from 'uuid';

const SALESFORCE_USERNAME = `${process.env.SF_USERNAME}`
const SALESFORCE_PASSWORD = `${process.env.SF_PASSWORD}${process.env.SF_SECURITY_TOKEN}`

export async function createTransaction() {
    try {
        var conn = new jsforce.Connection();
        console.log('sf_username',SALESFORCE_USERNAME)
        const userInfo = await conn.login(SALESFORCE_USERNAME, SALESFORCE_PASSWORD);
        console.log("userInfo", userInfo);

        // Query Salesforce
        const result = await conn.sobject("Order").create({ 
            AccountId: '0018d00000joJXIAA2',
            BillToContactId: '0038d00000k2lX9AAI',
            ShipToContactId: '0038d00000k2lX9AAI',
            //TotalAmount: 10.10,
            EffectiveDate: new Date(),
            OrderReferenceNumber: uuidv4(),
            Description: 'Number',
            Status: 'Draft'
        });
        return result.id;
    } catch (e) {
        console.error(e);
    }
}
