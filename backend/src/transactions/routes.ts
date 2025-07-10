import express from 'express';
import { create } from './handlers.js';
import { CreateTransactionSchema } from './types.js';
import { validate } from '../middleware/index.js'
import { requiresAuthentication } from '../middleware/authentication.js';

export default () => {

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', requiresAuthentication(['create-transaction']), validate(CreateTransactionSchema), create);

    return transactionRoutes
}