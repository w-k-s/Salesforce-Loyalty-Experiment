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

        const entity = result[0];
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
        };
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

    const updateTransaction = async (transaction) => {
        await db(tableName).where('id', '=', transaction.id).update({
            total_amount: transaction.totalAmount,
            modified_date: transaction.modifiedDate,
        });
    }

    return {
        findTransactionById,
        saveTransaction,
        updateTransaction
    }
}