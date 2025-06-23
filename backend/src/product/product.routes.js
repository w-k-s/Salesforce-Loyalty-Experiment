import express from 'express';
import handlers from './product.handlers.js';

export default ({loyalty}) => {
    const productHandlers = handlers({loyalty})

    const productRoutes = express.Router()
    productRoutes.get('/', productHandlers.getAll)

    return productRoutes
}