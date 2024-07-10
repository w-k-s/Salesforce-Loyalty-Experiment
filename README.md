# Loyalty Experiment

## Introduction

A proof of concept of an event-driven architecture wherein Salesforce Loyalty Management is the source of truth for the customers loyalty transactions, loyalty points, loyalty tier (e.t.c) and events from Salesforce can be used to build features around loyalty (e.g. awarding raffle tickets)

The purpose of this project is to:
- Demonstrate Event Driven Architecture where Salesforce is the Event source
- Demonstrate that building loyalty functionality powered by Salesforce but outside of Salesforce flows is more flexible, faster to develop, can be reviewed in PRs, can be tested end-to-end more thoroughly, loosely coupled and more conducive to a headless microservice architecture.

The Proof of Concept uses Salesforce Sales Cloud since it's free, but the intention would be to intgerate Salesforce Loyalty Management. To be more precise, I've used `Order`, `OrderItem` in `Salesforce Sales Cloud` in place of `TransactionJournal`, `Product`, `ProductLineItem` in Salesforce Loyalty.

**Note**: We're using Salesforce events to replicate the transaction history in a relational database store. The idea behind this is that reading and persisting transactions from the DB rather than Salesforce would reduce the number of queries, and the amount of data that needs to be stored in Salesforce which might be a more cost-effective use of a Salesforce License. In practice, this could get a little hairy e.g. if events are missed or processed twice.

## To Do

- [x] 1. Receive Order Event
- [x] 2. SFDX
- [x] 3. Issue raffle tickets when a transaction is done. 
- [x] 4. Autorenew PubSub Subscription
- [x] 5. Use CDC instead of Platform Events
- [x] 6. Setup DB connectivity
- [x] 7. Validate request, model classes to make the code clearer? Should I migrate to TypeScript?
- [ ] 8. Sign-up, Login, Authenticate Transaction API 
- [ ] 9. Sort out out-of-order events.

## Useful Resource

- [Salesforce Pub/Sub](https://jungleeforce.com/2021/11/11/connecting-to-salesforce-using-pub-sub-api-grpc/)
- [ExpressJS Folder Structure](https://www.codemzy.com/blog/nodejs-file-folder-structure)
- [Express Validator](https://stackoverflow.com/a/70637527/821110). Another [example](https://stackoverflow.com/a/60592312/821110) using Joi
- [Express Openid](https://medium.com/keycloak/keycloak-express-openid-client-fabea857f11f)