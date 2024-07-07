import express from 'express';
import routes from './routes.js'
import subscriptions from './subscriptions.js'
import { salesforceConnection, db } from './utils/config.js'
import bodyParser from 'body-parser';

const app = express()
const port = 3000

app.use(bodyParser.json())

routes({ app, salesforceConnection, db })
subscriptions({ salesforceConnection, db })

app.listen(port, () => {
  console.log(`Loyalty Backend listening on port ${port}`)
})