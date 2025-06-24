import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'
import productRoutes from './product/product.routes.js'

export default ({ app, loyalty, memberService }) => {
    app.use('/api/v1/txn', transactionRoutes({ loyalty }))
    app.use('/api/v1/user', memberRoutes({ loyalty, memberService }))
    app.use('/api/v1/product', productRoutes({ loyalty }))
    app.use('/health', (req, res) => res.status(204).send({}))
}