import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { SALESFORCE_USERNAME, SALESFORCE_PASSWORD, SALESFORCE_SECURITY_TOKEN } from './utils/config.js';
import { salesforceLogin } from './utils/salesforce.js';

const salesforceConnection = await salesforceLogin(
  SALESFORCE_USERNAME, 
  SALESFORCE_PASSWORD, 
  SALESFORCE_SECURITY_TOKEN
)

const app = express()
const port = 3000

routes(app, salesforceConnection)
subscriptions(salesforceConnection, pubsubClient)

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})