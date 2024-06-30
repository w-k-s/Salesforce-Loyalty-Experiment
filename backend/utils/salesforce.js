import jsforce from 'jsforce';
import grpc from '@grpc/grpc-js';
import avro from 'avro-js';
import protoLoader from '@grpc/proto-loader';
import EventEmitter from 'events';

export async function salesforceLogin(
    username,
    password,
    securityToken
) {
    const passwordWithSecurityToken = `${password}${securityToken}`
    const salesforceConnection = new jsforce.Connection({
        refreshFn: async (conn, callback) => {
            try {
                // re-auth to get a new access token
                await conn.login(username, passwordWithSecurityToken);
                if (!conn.accessToken) {
                    throw new Error('Access token not found after login');
                }
            
                console.log("Token refreshed")
            
                // 1st arg can be an `Error` or null if successful
                // 2nd arg should be the valid access token
                callback(null, conn.accessToken);
            } catch (err) {
                if (err instanceof Error) {
                    callback(err);
                } else {
                    throw err;
                }
            }
        }
    });
    await salesforceConnection.login(username, passwordWithSecurityToken);
    return salesforceConnection
}

export async function salesforcePubSubClient({
    salesforceConnection,
    protoFile
}){
    const packageDef = protoLoader.loadSync(protoFile, {});
    const grpcObj = grpc.loadPackageDefinition(packageDef);
    const sfdcPackage = grpcObj.eventbus.v1;

    const salesforceIdentity = await salesforceConnection.identity()
    const metaCallback = (_params, callback) => {
        const meta = new grpc.Metadata();
        meta.add("accesstoken", salesforceConnection.accessToken);
        meta.add("instanceurl", salesforceConnection.instanceUrl);
        meta.add("tenantid", salesforceIdentity.organization_id);
        callback(null, meta);
    };
  
    const callCreds = grpc.credentials.createFromMetadataGenerator(metaCallback);
    const combCreds = grpc.credentials.combineChannelCredentials(
        grpc.credentials.createSsl(),
        callCreds
    );

    return new sfdcPackage.PubSub(
        "api.pilot.pubsub.salesforce.com:7443",
        combCreds
    );
}

class AutorenewingSubscription extends EventEmitter{

    static async create(pubsubClient, topicName) {
        const schemaId = await new Promise((resolve, reject) => {
            pubsubClient.GetTopic({ topicName: topicName }, (error, res) => {
                if(error) {
                    reject(error)
                }else {
                    resolve(res.schemaId)
                }
            }
        )});

        const schema = await new Promise((resolve, reject) => {
            client.GetSchema({ schemaId: schemaId }, (error, res) => {
                if(error) {
                    reject(error)
                }else {
                    resolve(avro.parse(res.schemaJson))
                }
            }
        )});

        const subscription = client.Subscribe();
        subscription.on("data", (data) => {
            console.log("data => ", data);
            data.events.map((anEvent) => dataFn(schema.fromBuffer(anEvent.event.payload)));
        });
        subscription.on("end", ()=>{
            subscription.write({
                topicName: topicName,
                numRequested: 10,
            })
        });
        subscription.on("error", (err) => this.emit('error', err));
        subscription.on("status", (status) => this.emit('status', status));
        return subscription;
    }
}
