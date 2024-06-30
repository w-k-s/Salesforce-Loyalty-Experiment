import {subscribe} from './utils/salesforce.js'

export default (salesforceConnection, pubsubClient) => {
    const transactionSubscription = new TransactionSubscription(salesforceConnection)
    transactionSubscription.on('',()=>{

    })
}