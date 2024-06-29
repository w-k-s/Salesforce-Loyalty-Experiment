import transactionRoutes from './api/transactions/index.js'

export default (app) => {
    app.use('/api/v1/txn', transactionRoutes)
}