import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, knex } from './utils/config.js'

const app = express()
const port = 3000

routes({ app, salesforceConnection, db: knex })
subscriptions({ salesforceConnection, db: knex })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})