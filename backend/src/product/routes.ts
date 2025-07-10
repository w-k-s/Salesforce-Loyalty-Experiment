import express from 'express';
import { getAll } from './handlers.js';

export default () => {

    const productRoutes = express.Router()
    productRoutes.get('/', getAll)

    return productRoutes
}