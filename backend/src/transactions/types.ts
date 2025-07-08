import { z } from 'zod'

export const CreateTransactionSchema = z.object({
    customerId: z.string(), // contactId
    date: z.string()
        .datetime({ offset: true })
        .refine(d => new Date(d) >= new Date(), { message: 'Date must be in the future' }),
    products: z.array(
        z.object({
            id: z.string(), // PricebookEntry.Id
            quantity: z.number().int().min(1),
        })
    ).min(1),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;

export interface Transaction {
    id: string
    customerId: string
    transactionId: string
    transactionAmount: string
    raffleName?: string
    raffleTickets?: number
    createdDate: Date
    modifiedDate: Date
}