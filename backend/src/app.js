import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db } from './utils/config.js'
import bodyParser from 'body-parser';
import { auth } from 'express-openid-connect'



const app = express()
const port = 3000

// Configure session
app.set('trust proxy', true)
app.use(
  auth({
    issuerBaseURL: 'http://localhost:8080/realms/loyalty',
    baseURL: 'http://localhost:3000',
    clientID: 'account-console',
    secret: 'LONG_RANDOM_STRING'
  })
);

app.use(bodyParser.json())

routes({ app, salesforceConnection, db })
subscriptions({ salesforceConnection, db })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})