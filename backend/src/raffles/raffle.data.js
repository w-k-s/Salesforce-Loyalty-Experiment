export default (db) => {
    const tableName = 'raffle_transactions'
    const findRaffleTicketsForTransaction = async (transactionId) => {
        const result = await db.select('id', 'raffle_name', 'transaction_id', 'transaction_amount', 'tickets', 'customer_id')
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
        };
    }

    const saveRaffleTransaction = async (raffleTransaction) => {
        const raffleEntity = {
            id: raffleTransaction.id,
            raffle_name: raffleTransaction.raffleName,
            transaction_id: raffleTransaction.transactionId,
            transaction_amount: raffleTransaction.transactionAmount,
            tickets: raffleTransaction.tickets,
            customer_id: raffleTransaction.customerId
        }

        return await db.insert(raffleEntity).into(tableName)
    }

    const updateRaffleTransaction = async (raffleTransaction) => {
        await db(tableName).where('id', '=', raffleTransaction.id).update({
            transaction_amount: raffleTransaction.transactionAmount,
            tickets: raffleTransaction.tickets,
        });
    }

    return {
        findRaffleTicketsForTransaction,
        saveRaffleTransaction,
        updateRaffleTransaction
    }
}