import db from '../db/index.js'
import { type TransactionId } from '../loyalty/index.js'
import { Raffle } from './types.js'

const tableName = 'raffle_tickets'

export const findRaffleByTransactionId = async (transactionId: TransactionId): Promise<Raffle | 'NOT_FOUND'> => {
    const result = await db.select('raffle_name', 'transaction_id', 'transaction_amount', 'tickets', 'customer_id', 'created_date', 'modified_date')
        .from(tableName)
        .where({ 'transaction_id': transactionId })
        .first()

    if (result == undefined) {
        return 'NOT_FOUND'
    }

    const entity = result[0];
    return {
        transactionId: entity.transaction_id,
        raffleName: entity.raffle_name,
        totalAmount: entity.transaction_amount,
        raffleTickets: entity.raffle_tickets,
        customerId: entity.customer_id,
        createdDate: entity.created_date,
        modifiedDate: entity.modified_date,
    };
}

export const saveRaffleTransaction = async (raffleTransaction: Raffle): Promise<void> => {
    const raffleEntity = {
        raffle_name: raffleTransaction.raffleName,
        transaction_id: raffleTransaction.transactionId,
        transaction_amount: raffleTransaction.totalAmount,
        tickets: raffleTransaction.raffleTickets,
        customer_id: raffleTransaction.customerId,
        created_date: new Date(),
        modified_date: new Date(),
    }

    return await db.insert(raffleEntity).into(tableName)
}

export const updateRaffleTransaction = async (raffleTransaction: Raffle) => {
    await db(tableName).where('id', '=', raffleTransaction.transactionId).update({
        transaction_amount: raffleTransaction.totalAmount,
        tickets: raffleTransaction.raffleTickets,
        modified_date: new Date(),
    });
}
