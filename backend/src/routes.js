import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'

export default ({ app, transactionService, memberService, checkAuthenticated }) => {
    app.use('/api/v1/txn', checkAuthenticated, transactionRoutes(transactionService))
    app.use('/api/v1/user', memberRoutes(memberService))
}