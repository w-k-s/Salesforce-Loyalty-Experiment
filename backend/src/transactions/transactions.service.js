import { v4 as uuidv4 } from 'uuid';
import transactionDao from './transactions.data.js'
import raffleService from '../raffles/raffle.service.js';
import { SALESFORCE_PRICEBOOK2_ID } from '../utils/config.js';

export default ({ salesforceConnection, db }) => {
    const { saveTransaction, updateTransaction, findTransactionById } = transactionDao(db)
    const { issueRaffleTickets } = raffleService(db)

    const createTransaction = async ({ transaction }) => {
        try {
            const { id } = await salesforceConnection.sobject("Order").create({
                AccountId: '0018d00000joJXIAA2',
                BillToContactId: transaction.customerId,
                ShipToContactId: transaction.customerId,
                EffectiveDate: new Date(transaction.date),
                OrderReferenceNumber: uuidv4(),
                Status: 'Draft',
                Pricebook2Id: SALESFORCE_PRICEBOOK2_ID
            });

            const productIds = transaction.products.map((p) => p.id)

            const productPrices = await salesforceConnection.sobject("PricebookEntry")
                .select("Id, UnitPrice")
                .where({ Id: productIds })
                .limit(200)
                .execute();

            const productPriceLookup = new Map(productPrices.map((price) => [price.Id, price.UnitPrice]))

            for (const product of transaction.products) {
                const unitPrice = productPriceLookup.get(product.id)
                await salesforceConnection.sobject("OrderItem").create({
                    OrderId: id,
                    Quantity: product.quantity,
                    UnitPrice: unitPrice,
                    PricebookEntryId: product.id
                })
            }

            return id;
        } catch (e) {
            throw new Error(e.message)
        }
    }

    const onTransactionCreated = async (event) => {
        await saveTransaction(event);
        issueRaffleTickets(event);
    }

    /**
     * 
     * @returns true if the transaction was updated
     */
    const onTransactionUpdated = async (event) => {
        const updated = await updateTransaction(event, (oldTransaction) => {
            return oldTransaction.modifiedDate < event.modifiedDate
        })

        if (updated) {
            // An additional query is required because the event doesn't have most of the data.
            const transaction = await findTransactionById(event.id)
            issueRaffleTickets(transaction);
        }

        return updated
    }

    return {
        createTransaction,
        onTransactionCreated,
        onTransactionUpdated,
    }
}