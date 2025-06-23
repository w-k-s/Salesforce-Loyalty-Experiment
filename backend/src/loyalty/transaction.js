const SALESFORCE_ACCOUNT_ID = '0018d00000joJXIAA2';

export const createTransaction = async({transaction}) =>{
    const { id } = await salesforceConnection.sobject("Order").create({
        AccountId: SALESFORCE_ACCOUNT_ID,
        BillToContactId: transaction.customerId,
        ShipToContactId: transaction.customerId,
        EffectiveDate: new Date(transaction.date),
        OrderReferenceNumber: uuidv4(),
        Status: 'Draft',
        Description: 'Number',
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
}