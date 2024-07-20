import express from 'express';
import handlers from './transactions.handlers.js';
import { createTransactionSchema } from './transactions.validation.js';
import { validate } from '../middleware/index.js'
import { requiresScope } from '../middleware/authentication.js';

export default (transactionService) => {
    const transanctionHandlers = handlers(transactionService)

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', requiresScope('create-transaction'), validate(createTransactionSchema), transanctionHandlers.create);

    return transactionRoutes
}