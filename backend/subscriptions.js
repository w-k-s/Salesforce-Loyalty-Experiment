import { subscribe } from './utils/salesforce.js'

export default async (salesforcePubSubClient) => {

    const transactionSubscription = await subscribe(salesforcePubSubClient, '/event/Order_Event__e');
    transactionSubscription.on('data', (data) => console.log(`Event => ${JSON.stringify(data)}`));
    transactionSubscription.on('error', (err) => console.log(`Error => ${JSON.stringify(err)}`));
    transactionSubscription.on('status', (status) => console.log(`Status => ${JSON.stringify(status)}`));
}  