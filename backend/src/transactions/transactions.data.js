export default (db) => {
    const tableName = 'transactions'
    const findTransactionById = async (transactionId) => {
        const result = await db.select('id', 'order_number', 'description', 'total_amount', 'effective_date', 'customer_id', 'status', 'created_date', 'modified_date')
            .from(tableName)
            .where('id', transactionId)
            .limit(1)

        if (result.length == 0) {
            return null
        }

        return entityToTransaction(result[0]);
    }

    const saveTransaction = async (transaction) => {
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

    const updateTransaction = async (newTransaction, conditionFn) => {
        await db.transaction((trx) => {
            return db(tableName)
                .transacting(trx)
                .forUpdate()
                .select('id', 'order_number', 'description', 'total_amount', 'effective_date', 'customer_id', 'status', 'created_date', 'modified_date')
                .where('id', newTransaction.id)
                .limit(1)
                .then((records) => {
                    if (records.length == 0) {
                        return null
                    }
                    return entityToTransaction(records[0])
                })
                .then((oldTransaction) => {
                    const proceed = oldTransaction != null && (!conditionFn || conditionFn(oldTransaction))
                    if (proceed) {
                        return db(tableName).where('id', '=', oldTransaction.id).update({
                            total_amount: newTransaction.totalAmount,
                            modified_date: newTransaction.modifiedDate,
                        }).then(true)
                    }
                    return Promise.resolve(false)
                })
                .then((success) => {
                    return trx.commit().then(success)
                })
                .catch(async (err) => {
                    console.log(err)
                    return trx.rollback().then(false)
                })
        })
    }

    return {
        findTransactionById,
        saveTransaction,
        updateTransaction
    }
}

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