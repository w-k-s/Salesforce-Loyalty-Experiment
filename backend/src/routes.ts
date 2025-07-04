import { Request, Response } from 'express'
import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'
import productRoutes from './product/product.routes.js'

export default ({ app, loyalty, memberService }) => {
    app.use('/api/v1/txn', transactionRoutes())
    app.use('/api/v1/user', memberRoutes({ loyalty, memberService }))
    app.use('/api/v1/product', productRoutes())
    app.use('/health', (req: Request, res: Response) => res.status(204).send({}))
}