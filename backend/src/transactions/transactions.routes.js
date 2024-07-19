import express from 'express';
import handlers from './transactions.handlers.js';
import { createTransactionSchema } from './transactions.validation.js';
import { validate, hasScope } from '../middleware/index.js'

export default (transactionService, passport) => {
    const transanctionHandlers = handlers(transactionService)

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', hasScope(passport, 'create-transaction'), validate(createTransactionSchema), transanctionHandlers.create);

    return transactionRoutes
}