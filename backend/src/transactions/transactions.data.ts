import db from '../db/index.js'

const tableName = 'transactions'

export const findTransactionById = async (transactionId: string) => {
    const result = await db.select('id', 'order_number', 'description', 'total_amount', 'effective_date', 'customer_id', 'status', 'created_date', 'modified_date')
        .from(tableName)
        .where('id', transactionId)
        .limit(1)

    if (result.length == 0) {
        return null
    }

    return entityToTransaction(result[0]);
}

export const saveTransaction = async (transaction) => {
    const entity = {
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

    return await db.insert(entity).into(tableName)
}

// TODO: have this code reviewed
export const updateTransaction = async (newTransaction, conditionFn) => {
    let result = false
    await db.transaction(async (trx) => {
        return db(tableName)
            .transacting(trx)
            .forUpdate()
            .select('id', 'order_number', 'description', 'total_amount', 'effective_date', 'customer_id', 'status', 'created_date', 'modified_date')
            .where('id', newTransaction.id)
            .limit(1)
            .then((records) => {
                if (records.length === 0) {
                    throw new Error("record not found")
                }
                return records[0]
            })
            .then((record) => entityToTransaction(record))
            .then((oldTransaction) => {
                const proceed = oldTransaction !== null && (!conditionFn || conditionFn(oldTransaction));
                if (!proceed) {
                    throw new Error("stale update")
                }
                return db(tableName)
                    .transacting(trx)
                    .where('id', '=', oldTransaction.id)
                    .update({
                        total_amount: newTransaction.totalAmount,
                        modified_date: newTransaction.modifiedDate,
                    })
                    .then(trx.commit)
                    .then(() => result = true)
            }).catch((err) => {
                console.log("Failed to update", err)
                result = false
            })
    });
    return result
};


const entityToTransaction = (entity) => {
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