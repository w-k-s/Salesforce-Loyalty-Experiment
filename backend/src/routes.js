import transactionRoutes from './transactions/index.js'

export default ({ app, salesforceConnection, db }) => {
    app.use('/api/v1/txn', transactionRoutes({ salesforceConnection, db }))
}