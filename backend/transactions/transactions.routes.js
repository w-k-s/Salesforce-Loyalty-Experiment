import express from 'express';
import handlers from './transactions.handlers.js';

export default ({ salesforceConnection }) => {
    const transanctionHandlers = handlers({ salesforceConnection })

    const transactionRoutes = express.Router()
    transactionRoutes.post('/', transanctionHandlers.create);

    return transactionRoutes
}