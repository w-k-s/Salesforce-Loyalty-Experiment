import { Request, Response } from 'express'
import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'
import productRoutes from './product/product.routes.js'
import { errorResponse } from './middleware/errors.js';

export default (app) => {
    app.use('/api/v1/txn', transactionRoutes())
    app.use('/api/v1/user', memberRoutes())
    app.use('/api/v1/product', productRoutes())
    app.use('/health', (req: Request, res: Response) => res.status(204).send({}))
    app.use(errorResponse) // Must be at the end.
}