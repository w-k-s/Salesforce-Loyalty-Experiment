import { v4 as uuidv4 } from 'uuid';
import transactionDao from './transactions.data.js'
import raffleService from '../raffles/raffle.service.js';

export default ({ salesforceConnection, db }) => {
    const { saveTransaction, updateTransaction, findTransactionById } = transactionDao(db)
    const { issueRaffleTickets } = raffleService(db)

    const createTransaction = async () => {
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

            return id;
        } catch (e) {
            console.error(e);
        }
    }

    const onTransactionCreated = async (event) => {
        await saveTransaction(event);
        issueRaffleTickets(event);
    }

    const onTransactionUpdated = async (event) => {
        await updateTransaction(event);
        const transaction = await findTransactionById(event.id)
        if (transaction) {
            issueRaffleTickets(transaction);
        }
    }

    return {
        createTransaction,
        onTransactionCreated,
        onTransactionUpdated,
    }
}