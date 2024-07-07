import express from 'express';
import handlers from './transactions.handlers.js';
import { createTransactionSchema } from './transactions.validation.js';
import { validate } from '../middleware/index.js'

export default ({ salesforceConnection, db }) => {
    const transanctionHandlers = handlers({ salesforceConnection, db })

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', validate(createTransactionSchema), transanctionHandlers.create);

    return transactionRoutes
}