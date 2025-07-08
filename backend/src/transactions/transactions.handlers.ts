import { Request, Response } from 'express';
import loyalty, { type TransactionId, CreateTransactionJournal } from '../loyalty/index.js';
import { CreateTransactionRequest } from './types.js';


export const create = async (
  req: Request<unknown, unknown, CreateTransactionRequest>,
  res: Response<{ Id: TransactionId }>
) => {
  const body = req.body as CreateTransactionRequest;
  const payload: CreateTransactionJournal = {
    contactId: req.body.customerId,
    date: new Date(req.body.date),
    description: 'Nothing',
    products: body.products.map(p => ({
      id: p.id,
      quantity: p.quantity,
    })),
  };
  const result = await loyalty.createTransaction(payload);
  res.status(201).json({ Id: result });
};