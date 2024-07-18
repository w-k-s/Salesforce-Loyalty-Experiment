import memberRoutes from './member/member.routes.js'
import transactionRoutes from './transactions/index.js'
import authRoutes from './auth/auth.routes.js'
import passport from 'passport'
import { checkAuthenticated } from './middleware/index.js'

export default ({ app, transactionService, memberService, passport }) => {
    app.use('/auth', authRoutes())
    // TODO: verify grant type client credential, and client has scope to call this api
    app.use('/api/v1/txn', transactionRoutes(transactionService, passport))
    app.use('/api/v1/user', checkAuthenticated, memberRoutes(memberService))
}