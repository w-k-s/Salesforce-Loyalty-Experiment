import { createContact, findMemberById } from './contact.js';
import { default as TransactionEmitter } from './emitter.js';
import { listProducts } from './product.js';
import { createTransaction } from './transaction.js';
import { LoyaltyCRM } from './types.js';

export * from './types.js'

export { TransactionEmitter };

export default {
  createContact,
  findMemberById,
  listProducts,
  createTransaction
} satisfies LoyaltyCRM