import express from 'express';
import {create} from './transactions.handlers.js';

const transactionRoutes = express.Router()
transactionRoutes.post('/', create);

export default transactionRoutes;