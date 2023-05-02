# Specs

## General
- measuring impact of actions based on state
- agents send sats to each other based on impact
- impact represents potential transactions

### Agents
- an actor in the network

### Energy
- each agent runs an lnd node
- that agent holds a balance of sats as energy
- can send/receive sats


## Roadmap
### Alpha
Stack
- lnd
- polar
- nodejs
- typescript
- vite
- react

Architecture
- use server-client arch to prove the concept
- base off of https://docs.lightning.engineering/lapps/guides/polar-lapps & https://github.com/lightninglabs/builders-guide-sample-app
- use https://github.com/RadarTech/lnrpc (current) or switch to https://github.com/alexbosworth/lightning

App
- human agent action space
- perform actions
- assign impact as a function of opening a sat channel and sending to another node
- generate a random state space

Backend
- express server with api to connect with lnd node

Dashboard
- watches 
- web client connecting to directly to lnd nodes
- use either https://github.com/joule-labs/webln or https://github.com/lightninglabs/lnc-web


