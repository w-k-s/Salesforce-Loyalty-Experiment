import express from 'express';
import handlers from './product.handlers.js';

export default (productService) => {
    const productHandlers = handlers(productService)

    const productRoutes = express.Router()
    productRoutes.get('/', productHandlers.getAll)

    return productRoutes
}