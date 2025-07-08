import { v4 as uuidv4 } from 'uuid';
import { default as config } from '../config/index.js'
import { default as salesforceConnection } from './connection.js'
import { CreateTransactionJournal, TransactionId } from './types.js';
import { type SaveResult } from 'jsforce/index.js';

const { salesforce } = config

export const createTransaction = async (transaction: CreateTransactionJournal): Promise<TransactionId> => {

    const result: SaveResult = await salesforceConnection.sobject("Order").create({
        AccountId: salesforce.defaults.accountId,
        BillToContactId: transaction.contactId,
        ShipToContactId: transaction.contactId,
        EffectiveDate: transaction.date,
        OrderReferenceNumber: uuidv4(),
        Status: 'Draft',
        Description: transaction.description,
        Pricebook2Id: salesforce.defaults.pricebook2Id
    });

    if (!result.success) {
        throw new Error(result.errors.map((e) => e.message).join('. '))
    }

    const txnId: TransactionId = result.id
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
            OrderId: txnId,
            Quantity: product.quantity,
            UnitPrice: unitPrice,
            PricebookEntryId: product.id
        })
    }

    return txnId;
}