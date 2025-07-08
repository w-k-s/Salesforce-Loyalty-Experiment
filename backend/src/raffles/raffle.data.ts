import db from '../db/index.js'
import { type Transaction } from '../transactions/types.js'

const tableName = 'raffle_tickets'

export const findRaffleTicketsForTransaction = async (transactionId): Promise<Transaction | 'NOT_FOUND'> => {
    const result = await db.select('id', 'raffle_name', 'transaction_id', 'transaction_amount', 'tickets', 'customer_id', 'created_date', 'modified_date')
        .from(tableName)
        .where('transaction_id', transactionId)
        .limit(1)

    if (result.length == 0) {
        return 'NOT_FOUND'
    }

    const entity = result[0];
    return {
        id: entity.id,
        raffleName: entity.raffle_name,
        transactionId: entity.transaction_id,
        transactionAmount: entity.transaction_amount,
        raffleTickets: entity.raffle_tickets,
        customerId: entity.customer_id,
        createdDate: entity.created_date,
        modifiedDate: entity.modified_date,
    };
}

export const saveRaffleTransaction = async (raffleTransaction: Transaction): Promise<void> => {
    const raffleEntity = {
        id: raffleTransaction.id,
        raffle_name: raffleTransaction.raffleName,
        transaction_id: raffleTransaction.transactionId,
        transaction_amount: raffleTransaction.transactionAmount,
        tickets: raffleTransaction.raffleTickets,
        customer_id: raffleTransaction.customerId,
        created_date: new Date(),
        modified_date: new Date(),
    }

    return await db.insert(raffleEntity).into(tableName)
}

export const updateRaffleTransaction = async (raffleTransaction) => {
    await db(tableName).where('id', '=', raffleTransaction.id).update({
        transaction_amount: raffleTransaction.transactionAmount,
        tickets: raffleTransaction.tickets,
        modified_date: new Date(),
    });
}
