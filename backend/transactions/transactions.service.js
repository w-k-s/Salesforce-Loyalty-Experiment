import { v4 as uuidv4 } from 'uuid';
import raffleService from '../raffles/raffle.service.js';

export default ({ salesforceConnection, db }) => {
    const { issueRaffleTickets } = raffleService(db)

    return {
        createTransaction: async () => {
            try {
                const { id } = await salesforceConnection.sobject("Order").create({
                    AccountId: '0018d00000joJXIAA2',
                    BillToContactId: '0038d00000k2lX9AAI',
                    ShipToContactId: '0038d00000k2lX9AAI',
                    EffectiveDate: new Date(),
                    OrderReferenceNumber: uuidv4(),
                    Description: 'Number',
                    Status: 'Draft',
                    Pricebook2Id: '01s8d00000A4LSdAAN'
                });

                await salesforceConnection.sobject("OrderItem").create({
                    OrderId: id,
                    Quantity: 1,
                    UnitPrice: '100.0',
                    PricebookEntryId: '01u8d00000EkE6zAAF'
                })

            } catch (e) {
                console.error(e);
            }
        },
        onTransactionCreated: (transaction) => {
            console.log(`Transaction: ${JSON.stringify(transaction)}`)
            // TODO: Update transaction in table?
            issueRaffleTickets(transaction)
        },
        onTransactionUpdated: (transaction) => {
            console.log(`Transaction: ${JSON.stringify(transaction)}`)
            // TODO: Update transaction in table?
            issueRaffleTickets(transaction)
        }
    }


}