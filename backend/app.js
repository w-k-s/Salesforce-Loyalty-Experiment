import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import jsforce from 'jsforce';
import grpc from '@grpc/grpc-js';
import fs from 'fs';
import avro from 'avro-js';
import protoLoader from '@grpc/proto-loader';
import routes from './routes.js'
import { SALESFORCE_USERNAME, SALESFORCE_PASSWORD, SALESFORCE_SECURITY_TOKEN } from './utils/config.js';
import { salesforceLogin } from './utils/salesforce.js';

const packageDef = protoLoader.loadSync("sf.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const sfdcPackage = grpcObj.eventbus.v1;

const salesforceConnection = await salesforceLogin(
  SALESFORCE_USERNAME, 
  SALESFORCE_PASSWORD, 
  SALESFORCE_SECURITY_TOKEN
)

const app = express()
const port = 3000

routes(app, salesforceConnection)

const connectToGrpc = async () => {
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

  const client = new sfdcPackage.PubSub(
    "api.pilot.pubsub.salesforce.com:7443",
    combCreds
  );
  
  let topicName = '/event/Order_Event__e';
  let schemaId = '';
  let schema;
  client.GetTopic({ topicName: topicName }, (err, response) => {
    if(err) {
      //throw error
    }else { //get the schema information
      schemaId = response.schemaId
      client.GetSchema({ schemaId: schemaId }, (error, res) => {
        if(error) {
        //handle error
        }else {
          schema = avro.parse(res.schemaJson)
        }
      })
    }
  })

  const subscription = client.Subscribe(); //client here is the grpc client.
  //Since this is a stream, you can call the write method multiple times. 
  //Only the required data is being passed here, the topic name & the numReqested
  //Once the system has received the events == to numReqested then the stream will end. 
  subscription.write({
      topicName: topicName,
      numRequested: 10,
    });
  //listen to new events.
  subscription.on("data", function (data) {
    console.log("data => ", data);
    //data.events is an array of events. Below I am just parsing the first event. 
    //Please add the logic to handle mutiple events. 
    if (data.events) { 
      const payload = data.events[0].event.payload;
      let jsonData = schema.fromBuffer(payload);//this schema is the same which we retreived earlier in the GetSchema rpc. 
      console.log("Event details ==> ", jsonData);
    } else {
      //if there are no events then every 270 seconds the system will keep publishing the latestReplayId.
    }
  });
  subscription.on("end", function () {
    console.log("ended");
  });
  subscription.on("error", function (err) {
    console.log("error", JSON.stringify(err)); //handle errors
  });
  subscription.on("status", function (status) {
    console.log("status ==> ", status);
  });
}


connectToGrpc()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})