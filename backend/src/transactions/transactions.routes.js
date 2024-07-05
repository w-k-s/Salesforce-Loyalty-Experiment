import express from 'express';
import handlers from './transactions.handlers.js';

export default ({ salesforceConnection, db }) => {
    const transanctionHandlers = handlers({ salesforceConnection, db })

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', transanctionHandlers.create);

    return transactionRoutes
}