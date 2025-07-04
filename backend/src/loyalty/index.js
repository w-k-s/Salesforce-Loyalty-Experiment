import { createContact, findMemberById } from './contact.js';
import { TransactionEmitter } from './emitter.js';
import { listProducts } from './product.js';
import { createTransaction } from './transaction.js';

export { TransactionEmitter };

export default ({ salesforceConnection }) => {
  return {
    createContact: (params) => createContact({ salesforceConnection, params }),
    findMemberById: (id) => findMemberById({ salesforceConnection, id }),
    listProducts: () => listProducts({ salesforceConnection }),
    createTransaction: ({ transaction }) => createTransaction({ salesforceConnection, transaction })
  };
};