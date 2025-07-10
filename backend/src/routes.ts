import { Request, Response, Application } from 'express'
import memberRoutes from './member/routes.js'
import transactionRoutes from './transactions/index.js'
import productRoutes from './product/routes.js'
import { errorResponse } from './middleware/errors.js';

export default (app: Application) => {
    app.use('/api/v1/txn', transactionRoutes())
    app.use('/api/v1/user', memberRoutes())
    app.use('/api/v1/product', productRoutes())
    app.get('/health', (_req: Request, res: Response) => res.sendStatus(204))
    app.use(errorResponse) // Must be at the end.
}
