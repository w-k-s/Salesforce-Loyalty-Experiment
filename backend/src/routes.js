import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'
import productRoutes from './product/product.routes.js'

export default ({ app, transactionService, memberService, productService }) => {
    app.use('/api/v1/txn', transactionRoutes(transactionService))
    app.use('/api/v1/user', memberRoutes(memberService))
    app.use('/api/v1/product', productRoutes(productService))
    app.use('/health', (req, res) => res.status(204).send({}))
}