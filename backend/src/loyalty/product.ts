import { default as config } from '../config/index.js'
import { default as salesforceConnection } from './connection.js'
import { type Product } from './types.js'

const { salesforce } = config

export const listProducts = async (): Promise<Product[]> => {
    const products = await salesforceConnection.sobject("PricebookEntry")
        .select("Id, Name, Pricebook2Id, UnitPrice, ProductCode")
        .where({ Pricebook2Id: salesforce.defaults.pricebook2Id })
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
        } as Product
    })
}
