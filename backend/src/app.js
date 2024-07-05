import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db } from './utils/config.js'

const app = express()
const port = 3000

routes({ app, salesforceConnection, db })
subscriptions({ salesforceConnection, db })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})