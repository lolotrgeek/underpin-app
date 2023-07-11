# Underpin App
Implements the application for underpin using the bitcoin lightning network.

## Goals
Easy to make payments into fund.

1. create an account
2. add `sats` via wallet
3. internal ledger to track `impact`
4. 


Run a set of lightning nodes, 
1. open channels on behalf of the users and 
2. resolve invoices onbehalf of users.

Allow (resource rich, time poor) investors to enable (time rich, resource poor) builders.

## Setup
For testing you will need to download Polar `https://lightningpolar.com/` which lets easily spawn local lightning nodes as a docker container.

There is a pre-defined network that can be imported into polar in `/test-network` directory.


### 1. Setup a custom macaroon:

In Polar, Right click on carol's lnd node, select Launch Terminal, paste in 
```
lncli bakemacaroon info:read offchain:read invoices:read invoices:write message:read message:write 
```

copy the macaroon hex output in from above command to `./backend/config.json` as `macroon` value.

### 2. Install App

```
yarn
```
## Usage
```
yarn dev
```

## Building
User Creation
1. name
2. uuid
3. wallet
4. impact


Resolving invoices for users
1. `user A` initiates txn to `user B`
2. both are "our" users and have funds in our pool
3. so send invoice and resolve txn within system
4. show resolving msg then show done msg and update balance display

## Credits
Pulls code to connect with lnd nodes from https://github.com/lightninglabs/builders-guide-sample-app

Walkthrough here: https://docs.lightning.engineering/lapps/guides/polar-lapps/run-the-completed-app