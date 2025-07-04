import { v4 as uuidv4 } from 'uuid';
import { default as config } from '../config/index.js'
import { default as salesforceConnection } from './connection.js'

const { salesforce } = config

export const createTransaction = async ({ transaction }) => {
    console.log(transaction)
    const { id } = await salesforceConnection.sobject("Order").create({
        AccountId: salesforce.defaults.accountId,
        BillToContactId: transaction.customerId,
        ShipToContactId: transaction.customerId,
        EffectiveDate: new Date(transaction.date),
        OrderReferenceNumber: uuidv4(),
        Status: 'Draft',
        Description: 'Number',
        Pricebook2Id: salesforce.defaults.pricebook2Id
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
}