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

export async function createSalesforcePubSubClient(
    salesforceConnection,
    protoFile
){
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

export async function subscribe(pubsubClient, topicName) {
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
        pubsubClient.GetSchema({ schemaId: schemaId }, (error, res) => {
            if(error) {
                reject(error)
            }else {
                resolve(avro.parse(res.schemaJson))
            }
        }
    )});

    const emitter = new EventEmitter();
    const subscription = pubsubClient.Subscribe();
    subscription.write({
        topicName: topicName,
        numRequested: 1,
    })
    subscription.on("data", (data) => {
        console.log(`Subscription to Topic: '${topicName}'. Data: '${JSON.stringify(data)}'.`)
        data.events.map((anEvent) => emitter.emit('data',schema.fromBuffer(anEvent.event.payload)));
    });
    subscription.on("end", ()=>{
        console.log(`Subscription to Topic: '${topicName}'. Ended.`)
        emitter.emit('end')
    });
    subscription.on("error", (err) => {
        console.log(`Subscription to Topic: '${topicName}'. Error: '${JSON.stringify(err)}'.`)
        emitter.emit('error', err)
    });
    subscription.on("status", (status) => {
        console.log(`Subscription to Topic: '${topicName}'. Status: '${JSON.stringify(status)}'.`)
        emitter.emit('status', status)
    });
    return emitter;
}
