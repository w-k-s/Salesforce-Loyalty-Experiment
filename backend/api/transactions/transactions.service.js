import { v4 as uuidv4 } from 'uuid';
        
export async function createTransaction({salesforceConnection}) {
    try {
        const result = await salesforceConnection.sobject("Order").create({ 
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
