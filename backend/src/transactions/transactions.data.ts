import { Knex } from 'knex'
import db from '../db/index.js'
import { Transaction, TransactionId } from '../loyalty/types.js'

const tableName = 'transactions'

export const saveTransaction = async (transaction: Transaction) => {
    const { created_date, ...entity } = transactionToEntity(transaction)
    return await db.insert(entity).into(tableName)
}

export const updateTransaction = async (transaction: Transaction, trx?: Knex.Transaction) => {
    const entity = transactionToEntity(transaction)
    let query = db.where({ id: transaction.id }).update(entity)
    if (trx) {
        query = query.transacting(trx)
    }
    return await query
}

export const findTransactionById = async (
    transactionId: TransactionId,
    forUpdate: boolean = false
): Promise<Transaction | 'NOT_FOUND'> => {
    return await db.transaction(async (trx) => {
        let projection = trx(tableName)
            .where({ id: transactionId })

        if (forUpdate) {
            projection = projection.forUpdate()
        }
        let record = projection.first()
        return record ? entityToTransaction(record) : 'NOT_FOUND'
    })
}

const entityToTransaction = (entity): Transaction => {
    return {
        id: entity.id,
        orderNumber: entity.order_number,
        description: entity.description,
        totalAmount: entity.total_amount,
        effectiveDate: entity.effective_date,
        customerId: entity.customer_id,
        status: entity.status,
        createdDate: entity.created_date,
        modifiedDate: entity.modified_date,
    }
}

const transactionToEntity = (transaction: Transaction) => {
    return {
        id: transaction.id,
        order_number: transaction.orderNumber,
        description: transaction.description,
        total_amount: transaction.totalAmount,
        effective_date: transaction.effectiveDate,
        customer_id: transaction.customerId,
        status: transaction.status,
        created_date: transaction.createdDate,
        modified_date: transaction.modifiedDate
    }
}