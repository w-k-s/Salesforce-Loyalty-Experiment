# Loyalty Experiment

## Introduction

A proof of concept of an loyalty backend wherein Salesforce Loyalty Management is the source of truth for the customers loyalty transactions, points, tier (e.t.c).

The purpose of this project is to:
- Evaluate NodeJS libraries for Salesforce vs. propietary solutions e.g. Mulesoft
- Demonstrate and Evaluate NodeJS libraries for building an Event Driven Architecture where Salesforce is the Event source
- Demonstrate that building loyalty functionality powered by Salesforce but outside of Salesforce (and Mulesoft) flows is more flexible to change, faster to develop, can be validated in PRs, can be tested end-to-end more thoroughly, loosely coupled to a particular SaaS and more conducive to a headless microservice architecture.

The Proof of Concept uses Salesforce Sales Cloud since it's free, but the intention would be to intgerate Salesforce Loyalty Management. To be more precise, I've used `Order`, `OrderItem` in `Salesforce Sales Cloud` in place of `TransactionJournal`, `Product`, `ProductLineItem` in Salesforce Loyalty.

**Note**: We're using Salesforce events to replicate the transaction history in a relational database store. The idea behind this is to own our own data (rather than rely on a SaaS product for storage). It might also reduce the number of queries to Salesforce resulting in an overall more cost-effective use of a their License. In practice, this could get a little hairy e.g. if events are missed or processed twice.

## To Do

- [x] 1. Receive Order Event
- [x] 2. SFDX
- [x] 3. Issue raffle tickets when a transaction is done. 
- [x] 4. Autorenew PubSub Subscription
- [x] 5. Use CDC instead of Platform Events
- [x] 6. Setup DB connectivity
- [x] 7. Validate request, model classes to make the code clearer? Should I migrate to TypeScript?
- [x] 8. Sort out out-of-order events.
- [x] 9. Sign-up as Member (Username/Password)
- [x] 10. Login as Member, View own Profile (but not other)
- [x] 11. Use client_credentials grant for Transaction API 
- [ ] 13. Sign-up and sign-in with Google.

## Useful Resource

- [Salesforce Pub/Sub](https://jungleeforce.com/2021/11/11/connecting-to-salesforce-using-pub-sub-api-grpc/)
- [ExpressJS Folder Structure](https://www.codemzy.com/blog/nodejs-file-folder-structure)
- [Express Validator](https://stackoverflow.com/a/70637527/821110). Another [example](https://stackoverflow.com/a/60592312/821110) using Joi
- [Express Openid](https://medium.com/keycloak/keycloak-express-openid-client-fabea857f11f)
- [Express & PassportJS](https://curity.io/resources/learn/oidc-node-express/)
- [Add Custom Claims to OpenID Token](https://medium.com/@ramanamuttana/custom-attribute-in-keycloak-access-token-831b4be7384a)
- [Add more info to userInfo endpoint](https://stackoverflow.com/questions/75869268/get-roles-from-keycloak-userinfo-endpoint)
- [OpenID Configuration](http://localhost:8080/realms/loyalty/.well-known/openid-configuration)
- [NodeJS Redis Cheatsheet](https://redis.js.org/#node-redis-usage-redis-commands)

```shell
docker exec -it keycloak sh
cd ~/bin

./kc.sh export --realm loyalty --file /tmp/export/loyalty.json --db postgres --db-url jdbc:postgresql://authdb:5432/keycloak --db-username postgres --db-password password

./kc.sh export --realm master --file /tmp/export/master.json --db postgres --db-url jdbc:postgresql://authdb:5432/keycloak --db-username postgres --db-password password
```