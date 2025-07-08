# Loyalty Experiment

## Introduction

A proof of concept of an loyalty backend wherein Salesforce Loyalty Management is the source of truth for the customers loyalty transactions, points, tier (e.t.c).

The purpose of this project is to:
- Evaluate NodeJS libraries for Salesforce vs. propietary solutions e.g. Mulesoft
- Demonstrate and Evaluate NodeJS libraries for building an Event Driven Architecture where Salesforce is the Event source
- Demonstrate that building loyalty functionality powered by Salesforce but outside of Salesforce (and Mulesoft) flows is more flexible to change, faster to develop, can be validated in PRs, can be tested end-to-end more thoroughly, loosely coupled to a particular SaaS and more conducive to a headless microservice architecture.

The Proof of Concept uses Salesforce Sales Cloud since it's free, but the intention would be to intgerate Salesforce Loyalty Management. To be more precise, I've used `Order`, `OrderItem` in `Salesforce Sales Cloud` in place of `TransactionJournal`, `Product`, `ProductLineItem` in Salesforce Loyalty.

**Note**: We're using Salesforce events to replicate the transaction history in a relational database store. The idea behind this is to own our own data (rather than rely on a SaaS product for storage). It might also reduce the number of queries to Salesforce resulting in an overall more cost-effective use of a their License. In practice, this could get a little hairy e.g. if events are missed or processed twice.

## Glossary

- **Loyalty Application**: A loyalty application is an application that allows you to take advantage of rewards earned from repeatedly using a service. A good example is Airline Frequent Flyer programmes that offer you benefits for repeatedly travelling with the airline.

- **Loyalty Partners**: A loyalty partner is a company that either expands or enhances the loyalty eco-system. 

    For example; a car rental companies could expand a frequent flyer programme so that you earn miles not only when you fly, but also when you rent a car and drive.

    hotels could enhance the frequent flyer programme by offering a discounted stay in exchange for redeeming miles.

    This project only considers partners that expand the ecosystem. In this respect, partner companies notify the loyalty backend when a transaction occurs so that the programme member earns loyalty currency.

---

## Migrations

### Create Migration File

```
npx knex migrate:make create_raffles_table 
```

## Keycloak

### Importing/Exporting realms

- The following commands were used to export the keycloak realms. These commands were run in the containers, with the output directory mounted to the host machine.

```shell
docker exec -it keycloak sh
cd ~/bin

./kc.sh export --realm loyalty --file /tmp/export/loyalty.json --db postgres --db-url jdbc:postgresql://authdb:5432/keycloak --db-username postgres --db-password password

./kc.sh export --realm master --file /tmp/export/master.json --db postgres --db-url jdbc:postgresql://authdb:5432/keycloak --db-username postgres --db-password password
```

- I think the master realm can't be imported. This means that `docker compose up -d` pretty much spins up everything ready to go, except that admin-cli needs to be configured for signing-up users. See [guide](./backend/docs/keycloak-setup.md#sign-up)

## Salesforce

Salesforce events are triggered through Change Data Capture. The setup is shown below:

![Salesforce CDC](./backend/docs/media/Salesforce-CDC-Setup.png)

---
## curl Requests

### Create Member

**Prerequisite**

- Setup Realm roles for `loyalty-members` (all members will have this role)
- Setup admin-cli client to be able to manage users and roles in loyalty realm. Tutorial.
- Set mobile number and salesforceId as custom attributes on user.

**Request**

```shell
curl -X POST --json "$(jq -n \
  --arg fn "John" \
  --arg ln "Doe" \
  --arg pwd "12345678" \
  --arg mobile "971561234567" \
  --arg email "john$(date +%Y%m%d%H%M%S)@doe.com" \
  --arg birth "1970-01-01" \
  '{firstName: $fn, lastName: $ln, password: $pwd, mobileNumber: $mobile, email: $email, birthDate: $birth}')" \
http://localhost:3000/api/v1/user/register
```

**Response**

```json
{
    "id": "003gL00000721XAQAY",
    "firstName": "John",
    "lastName": "Doe",
    "password": "12345678",
    "mobileNumber": "971561234567",
    "email": "john20250707190156@doe.com",
    "birthDate": "1970-01-01"
}  
```

### Get Access Token for Member

**Prerequisite**

- Include salesforceId in access token. Tutorial.

**Request**

```shell
curl -X POST "http://localhost:8080/realms/loyalty/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=loyalty-client" \
  -d "client_secret=yuz1GRD9NuOenMKuMCFKQLxg0wSj4mZp" \
  -d "grant_type=password" \
  -d "username=john20250707190156@doe.com" \
  -d "password=12345678"
```

**Response**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJncUFhSmFOSE9yMkVKRVVZd0lBQ3IwUHJ5OXFBMjlqTnhrTkNsSUVaMWxJIn0.eyJleHAiOjE3NTIwMDA2MTAsImlhdCI6MTc1MjAwMDMxMCwianRpIjoiODg2MTkxZTUtNGM1OC00MWE2LTg3MjctY2MxMTBjYWJiNjMxIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9sb3lhbHR5IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjhiNmE5OWY1LWFlNzgtNGJlNi05YTBlLWVmNTNjYzQxNDA4MyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImxveWFsdHktY2xpZW50Iiwic2lkIjoiMWFhNDc3OWItNTQzMy00ZjljLTk1OTktZTg4OTA1ZWVlNDcyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwibG95YWx0eS1tZW1iZXIiLCJkZWZhdWx0LXJvbGVzLWxveWFsdHkiLCJ1bWFfYXV0aG9yaXphdGlvbiIsInZpZXctcHJvZmlsZSJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSm9obiBEb2UiLCJjdXN0b21lcklkIjoiMDAzZ0wwMDAwMDcyMVhBUUFZIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiam9objIwMjUwNzA3MTkwMTU2QGRvZS5jb20iLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwiZW1haWwiOiJqb2huMjAyNTA3MDcxOTAxNTZAZG9lLmNvbSJ9.UxSvohKZn2Opr2negixYpvs-FSa9ZD259xYyPv8j1UaBvpWTe1CfW_1H4b7_enmdjWpsOcai8zlkPVtT3dU49RXldkC-4UHWstFOgbRrqFP7M0jcbLz4jdjPOG0XaKd_I0FNLsSTFZi9ukTlKUr-I3I62EyV1USOzyim61ag8NSpTuuws9KBtAoeZqONuXRuOtNVuyrbJjucqPKvwwkuHjppYV9xKkEVyYsPaQMJQUdn6e2bxLQGzTEPGMjKCzEgFcl1AOxbpFQA-g1MdT6Mr8f2bmRKgam5zxJAA8f1r72adUL0S0oENv_5a8YU_iX9eqq_QXMCeUYg-BK4j7qR2Q",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmMGMwNmQxYS1lMWViLTQ4MGItYjc1Yy1lMTgyNGNiMmZiNmYifQ.eyJleHAiOjE3NTIwMDIxMTAsImlhdCI6MTc1MjAwMDMxMCwianRpIjoiZjk4NmVkNWMtN2M1Ni00MGU1LWE1MDEtZTZmODcyZjhiMmVjIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9sb3lhbHR5IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9sb3lhbHR5Iiwic3ViIjoiOGI2YTk5ZjUtYWU3OC00YmU2LTlhMGUtZWY1M2NjNDE0MDgzIiwidHlwIjoiUmVmcmVzaCIsImF6cCI6ImxveWFsdHktY2xpZW50Iiwic2lkIjoiMWFhNDc3OWItNTQzMy00ZjljLTk1OTktZTg4OTA1ZWVlNDcyIiwic2NvcGUiOiJhY3IgcHJvZmlsZSBiYXNpYyBlbWFpbCByb2xlcyB3ZWItb3JpZ2lucyJ9.673xqzKFGkpDWFUBJy4HvDryG7_X1GEbQpO8hXr_ZWg1R_SBBzTkEoWS4tnpDkJx3cmAeqKR3KD6MBTUsUpYag",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "1aa4779b-5433-4f9c-9599-e88905eee472",
  "scope": "profile email"
}
```

### Get Member Profile

**Prerequisite**
- Grant permission to `view-profile` to all users in loyalty-member role.

**Request**

```shell
curl -X GET "http://localhost:3000/api/v1/user/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ********"
```

**Response**

```json
{
  "id": "003gL00000721XAQAY",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john20250707190156@doe.com",
  "mobileNumber": "971561234567",
  "birthDate": "1970-01-01T00:00:00.000Z"
}
```

### OpenID Configuration

**Request**
```shell
curl 'http://localhost:8080/realms/loyalty/.well-known/openid-configuration'
```

### Get Client Credentials Token

**Prerequisite**
- Setup Realm roles for `loyalty-partners` (all partners will have this role)
- Grant permission to `create-transaction` to all users in `loyalty-partners` role.
- Include `aud` in the `client_credentials` token (not included by default).

**Request**

```shell
curl -X POST "http://localhost:8080/realms/loyalty/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=partner-1" \
  -d "client_secret=nclE6t6UubT2bFTCXqA53bQ0cSqLcT6u"
```

**Response**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJncUFhSmFOSE9yMkVKRVVZd0lBQ3IwUHJ5OXFBMjlqTnhrTkNsSUVaMWxJIn0.eyJleHAiOjE3NTIwMDMzMDQsImlhdCI6MTc1MjAwMzAwNCwianRpIjoiOWZhNDg4NDItNDgxYi00NTI0LTkzM2QtZjVlYWNhMjIwOTMyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9sb3lhbHR5IiwiYXVkIjpbImFjY291bnQiLCIwZGYwM2I5MC0wNDY2LTRkOTItYTdjMi02MzM2YmFkMDZhN2MiXSwic3ViIjoiMTdmOWFjODctMjljMS00Y2Y0LWE2ZTUtNzBhNDQ5ZWY2ZmQ3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicGFydG5lci0xIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsibG95YWx0eS1wYXJ0bmVyIiwiY3JlYXRlLXRyYW5zYWN0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicGFydG5lci0xIjp7InJvbGVzIjpbInVtYV9wcm90ZWN0aW9uIl19fSwic2NvcGUiOiJwYXJ0bmVyLWF1ZDIgcHJvZmlsZSBlbWFpbCIsInVwbiI6InNlcnZpY2UtYWNjb3VudC1wYXJ0bmVyLTEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImNsaWVudEhvc3QiOiIxOTIuMTY4LjY1LjEiLCJhZGRyZXNzIjp7fSwiZ3JvdXBzIjpbImxveWFsdHktcGFydG5lciIsImNyZWF0ZS10cmFuc2FjdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtcGFydG5lci0xIiwiY2xpZW50QWRkcmVzcyI6IjE5Mi4xNjguNjUuMSIsImNsaWVudF9pZCI6InBhcnRuZXItMSJ9.M1DvtxihY_HVm924G1qK05X9K5DPYBuhVbWoiVWtKxjUF8ALYr0aKDytft6LvItBQdElouaP1lbrBWQLL7eLuPWlZ1sjQqujvlrFEuOdMBaP0X8Wdthag1fJrY4qWiPpwwfWVU8ctkj6f8dhZIu-jGND2HUdKdq2EZ9AXNk5xanZYlq5owDhAcxAgpEr5SczmZsYEIlC0OOybzT7IQtI21BqGn56D-HSA62SHfpiR7-IpSF_J0q7JAuOON5LV8DKYoKspaOPm_DKw0yGxGoeRUCF8LMbTyXshJjZ89CmO6ouvhBRK0NhR5709h1zC8rIiCCXomVkKk1BksnkicnuOA",
  "expires_in": 300,
  "refresh_expires_in": 0,
  "token_type": "Bearer",
  "not-before-policy": 0,
  "scope": "partner-aud2 profile email"
}
```

### Get Product List

**Request**

```shell
curl http://localhost:3000/api/v1/product
```

**Response**

```json
{
  "products": [
    {
      "id": "01ugL000000qZJRQA2",
      "name": "GenWatt Diesel 200kW",
      "code": "GC1040",
      "unitPrice": 25000
    },
    {
      "id": "01ugL000000qZJSQA2",
      "name": "GenWatt Diesel 10kW",
      "code": "GC1020",
      "unitPrice": 5000
    },
    {
      "id": "01ugL000000qZJTQA2",
      "name": "Installation: Industrial - High",
      "code": "IN7080",
      "unitPrice": 85000
    },
    {
      "id": "01ugL000000qZJUQA2",
      "name": "SLA: Silver",
      "code": "SL9040",
      "unitPrice": 20000
    },
    {
      "id": "01ugL000000qZJVQA2",
      "name": "GenWatt Propane 500kW",
      "code": "GC3040",
      "unitPrice": 50000
    },
    {
      "id": "01ugL000000qZJWQA2",
      "name": "SLA: Platinum",
      "code": "SL9080",
      "unitPrice": 40000
    }
]}
```

### Create Transaction

**Prerequisite**
- Grant permission to `create-transaction` to all users in `loyalty-partners` role.

**Request**

```shell
curl -X POST --json '{"customerId":"003gL00000721XAQAY","date":"2025-07-09T00:00:00Z","products":[{"id":"01ugL000000qZJRQA2","quantity":2}]}' -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJncUFhSmFOSE9yMkVKRVVZd0lBQ3IwUHJ5OXFBMjlqTnhrTkNsSUVaMWxJIn0.eyJleHAiOjE3NTIwMDMzMDQsImlhdCI6MTc1MjAwMzAwNCwianRpIjoiOWZhNDg4NDItNDgxYi00NTI0LTkzM2QtZjVlYWNhMjIwOTMyIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9sb3lhbHR5IiwiYXVkIjpbImFjY291bnQiLCIwZGYwM2I5MC0wNDY2LTRkOTItYTdjMi02MzM2YmFkMDZhN2MiXSwic3ViIjoiMTdmOWFjODctMjljMS00Y2Y0LWE2ZTUtNzBhNDQ5ZWY2ZmQ3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicGFydG5lci0xIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsibG95YWx0eS1wYXJ0bmVyIiwiY3JlYXRlLXRyYW5zYWN0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicGFydG5lci0xIjp7InJvbGVzIjpbInVtYV9wcm90ZWN0aW9uIl19fSwic2NvcGUiOiJwYXJ0bmVyLWF1ZDIgcHJvZmlsZSBlbWFpbCIsInVwbiI6InNlcnZpY2UtYWNjb3VudC1wYXJ0bmVyLTEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImNsaWVudEhvc3QiOiIxOTIuMTY4LjY1LjEiLCJhZGRyZXNzIjp7fSwiZ3JvdXBzIjpbImxveWFsdHktcGFydG5lciIsImNyZWF0ZS10cmFuc2FjdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtcGFydG5lci0xIiwiY2xpZW50QWRkcmVzcyI6IjE5Mi4xNjguNjUuMSIsImNsaWVudF9pZCI6InBhcnRuZXItMSJ9.M1DvtxihY_HVm924G1qK05X9K5DPYBuhVbWoiVWtKxjUF8ALYr0aKDytft6LvItBQdElouaP1lbrBWQLL7eLuPWlZ1sjQqujvlrFEuOdMBaP0X8Wdthag1fJrY4qWiPpwwfWVU8ctkj6f8dhZIu-jGND2HUdKdq2EZ9AXNk5xanZYlq5owDhAcxAgpEr5SczmZsYEIlC0OOybzT7IQtI21BqGn56D-HSA62SHfpiR7-IpSF_J0q7JAuOON5LV8DKYoKspaOPm_DKw0yGxGoeRUCF8LMbTyXshJjZ89CmO6ouvhBRK0NhR5709h1zC8rIiCCXomVkKk1BksnkicnuOA' http://localhost:3000/api/v1/txn 
```

***Response**
```json
{
    "Id":"801gL00000DLfS5QAL"
}

---

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
