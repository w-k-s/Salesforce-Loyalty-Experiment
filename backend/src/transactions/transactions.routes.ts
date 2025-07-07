import express from 'express';
import { create } from './transactions.handlers.js';
import { CreateTransactionSchema } from './types.js';
import { validate } from '../middleware/index.js'
import { requiresScope } from '../middleware/authentication.js';

export default () => {

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', requiresScope('create-transaction'), validate(CreateTransactionSchema), create);

    return transactionRoutes
}