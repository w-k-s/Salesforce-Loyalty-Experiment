import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, salesforcePubSubClient } from './utils/config.js'

const app = express()
const port = 3000

routes(app, salesforceConnection)
subscriptions(salesforcePubSubClient)

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})