import express from 'express';
import { create } from './transactions.handlers.js';
import { createTransactionSchema } from './transactions.validation.js';
import { validate } from '../middleware/index.js'
import { requiresScope } from '../middleware/authentication.js';

export default () => {

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', requiresScope('create-transaction'), validate(createTransactionSchema), create);

    return transactionRoutes
}