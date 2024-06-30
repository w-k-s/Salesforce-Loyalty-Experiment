# Issuing raffle tickets 

## Option 1: Build raffle ticket logic in backend
- Create the txn in Salesforce
- Backend receives txn event, issues raffle ticket

	```
	GIVEN a transaction request
	WHEN created in salesforce:
	THEN txn event received in backend from salesforce
	- Txn Service: 
		- Saves to txn history table
	- Raffle Service: 
		- Checks if raffle is active
			- active: issue raffle
			- else: do nothing
	```

## Option 2: Build raffle ticket logic in CRM
- Create the txn in Salesforce, publish txn event
- Check if raffle is active on Salesforce, calculate num of raffles, publish raffle event

	```
	GIVEN a transaction request
	WHEN created in salesforce
	THEN 
	- Txn Service: 
		- txn event received in backend from salesforce
		- Saves to txn history table
	- Raffle Service: 
		- raffle event received in backend from salesforce
		- issue raffle
	```

## Decision

- Salesforce Loyalty Management is the source of truth for loyalty i.e. when a transaction happens, points are awarded, tiers are upgraded and promotions are made eligible.

- Issuing a raffle is an independant feature, separate from the loyalty management solution (be it Salesforce, Comarsh) or others.

- Therefore, it makes sense to build the raffle logic outside of the CRM. Reduces coupling and custom development on CRM