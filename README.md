# Loyalty Experiment

## Introduction

A proof of concept of an event-driven architecture wherein Salesforce Loyalty Management is the source of truth for the customers loyalty transactions, loyalty points, loyalty tier (e.t.c) and events from Salesforce can be used to build features around loyalty (e.g. awarding raffle tickets)

The purpose of this project is to:
- Demonstrate Event Driven Architecture where Salesforce is the Event source
- Demonstrate that building loyalty functionality powered by Salesforce but outside of Salesforce flows is faster to develop, can be reviewed in PRs, can be tested end-to-end more thoroughly, loosely coupled.

The Proof of Concept uses Salesforce Sales Cloud since it's free, but the intention would be to intgerate Salesforce Loyalty Management.

**Note**: We're using Salesforce events to replicate the transaction history in a relational database store. The idea behind this is that reading and persisting transactions from the DB rather than Salesforce would reduce the number of queries, and the amount of data that needs to be stored in Salesforce which might be a more cost-effective use of a Salesforce License. In practice, this could get a little hairy e.g. if events are missed or processed twice.

## To Do

- [x] 1. Receive Order Event
- [x] 2. SFDX
- [ ] 3. On Order Event (Issue Voucher, Save Txn History to DB)
- [ ] 4. Autorenew Subscription
- [ ] 5. Use CDC instead of Platform Events
- [ ] 6. Authenticated API 

## Pending Questions

- [x] How to inject Salesforce connection?
- [x] How to manage connection lifecycle ([Refresh Handler](https://jsforce.github.io/document/#session-refresh-handler))
- [ ] How to keep the salesforce subscription renewed?

## Useful Resource

- [Salesforce Pub/Sub](https://jungleeforce.com/2021/11/11/connecting-to-salesforce-using-pub-sub-api-grpc/)
- [ExpressJS Folder Structure](https://www.codemzy.com/blog/nodejs-file-folder-structure)
- [Someone else's approach](https://salesforce.stackexchange.com/questions/380092/change-data-capture-event-retrieving-values-for-all-fields)