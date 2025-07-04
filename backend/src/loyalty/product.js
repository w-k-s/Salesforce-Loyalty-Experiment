import { SALESFORCE_PRICEBOOK2_ID } from './constants.js'

export const listProducts = async ({ salesforceConnection }) => {
    const products = await salesforceConnection.sobject("PricebookEntry")
        .select("Id, Name, Pricebook2Id, UnitPrice, ProductCode")
        .where({ Pricebook2Id: SALESFORCE_PRICEBOOK2_ID })
        .limit(200)
        .execute();

    if (products.length === 0) {
        return []
    }

    return products.map((product) => {
        return {
            id: product.Id,
            name: product.Name,
            code: product.ProductCode,
            unitPrice: product.UnitPrice,
        }
    })
}
