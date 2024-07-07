export default (db) => {
    const tableName = 'raffle_tickets'
    const findRaffleTicketsForTransaction = async (transactionId) => {
        const result = await db.select('id', 'raffle_name', 'transaction_id', 'transaction_amount', 'tickets', 'customer_id', 'created_date', 'modified_date')
            .from(tableName)
            .where('transaction_id', transactionId)
            .limit(1)

        if (result.length == 0) {
            return null
        }

        const entity = result[0];
        return {
            id: entity.id,
            raffleName: entity.raffle_name,
            transactionId: entity.transaction_id,
            transactionAmount: entity.transaction_amount,
            tickets: entity.tickets,
            customerId: entity.customer_id,
            createdDate: entity.created_date,
            modifiedDate: entity.modified_date,
        };
    }

    const saveRaffleTransaction = async (raffleTransaction) => {
        const raffleEntity = {
            id: raffleTransaction.id,
            raffle_name: raffleTransaction.raffleName,
            transaction_id: raffleTransaction.transactionId,
            transaction_amount: raffleTransaction.transactionAmount,
            tickets: raffleTransaction.tickets,
            customer_id: raffleTransaction.customerId,
            created_date: Date.now(),
            modified_date: Date.now(),
        }

        return await db.insert(raffleEntity).into(tableName)
    }

    const updateRaffleTransaction = async (raffleTransaction) => {
        await db(tableName).where('id', '=', raffleTransaction.id).update({
            transaction_amount: raffleTransaction.transactionAmount,
            tickets: raffleTransaction.tickets,
            modified_date: Date.now(),
        });
    }

    return {
        findRaffleTicketsForTransaction,
        saveRaffleTransaction,
        updateRaffleTransaction
    }
}