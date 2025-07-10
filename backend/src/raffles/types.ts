import { type TransactionId, type ContactId } from '../loyalty/index.js'

export type Raffle = {
    transactionId: TransactionId
    customerId: ContactId
    raffleName: string
    raffleTickets: BigInt
    totalAmount: number
    createdDate: Date
    modifiedDate: Date
}