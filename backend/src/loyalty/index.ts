import { createContact, findMemberById } from './contact.js';
import { default as TransactionEmitter } from './emitter.js';
import { listProducts } from './product.js';
import { createTransaction } from './transaction.js';

export { TransactionEmitter };

export default {
  createContact: (params) => createContact({ request: params }),
  findMemberById: (id) => findMemberById({ id }),
  listProducts,
  createTransaction
}