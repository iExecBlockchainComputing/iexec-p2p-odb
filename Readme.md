# Note

This repository is deprecated and is no longer maintained



iExecODBP2P
===

Introduction
---

The iExecODB (iExec Open Decentralised brokering), introduced in V3, is the base of the iExec marketplace. It was designed as a hybrid on-chain/off-chain protocols, offering both the security and decentralisation of the blockchain, and the low cost of off-chain communications and storage. This protocol, designed in July 2018, and live since May 2019 includes many features, some of them still not being fully utilised by the iExec stack.

Despite the protocol being decentralised in its design, the current implementation still relies on centralised entities such as the iExec order store. This is a service, provided by iExec, for users to share their, and query other people's, orders. It is accessible directly from the [iExec marketplace](https://market.iex.ec) or through the [iExec SDK](http://github.com/iExecBlockchainComputing/sdk).

The objective of iExecODBP2P is to propose a decentralised alternative to the iExec order store.

iExecODBP2P is a P2P network of nodes that stores and keep track of iExec ODB orders. This includes broadcasting new orders, searching existing orders, and keeping track of old, invalid, orders.

Quickstart
---

To start a minimal iExecODBP2P node, you should:

1. Install all the dependencies: `npm install` or `yarn install`
2. Start the node: `npm run start` or `yarn start` or `node src/node/index.js`

Additional (independant) features can be enabled using envvars:

- Enable blockhain listenning using `LISTEN=1`. This will have your node listen for new orders being broadcasted and old orders (cancelled/consummed) becoming invalid.
- Enable the Rest API on http port `XXX` using `PORT=XXX`. This will spin up an rest api to query the iExecODBP2P network through http request.

API
---

The Rest API, enabled using the `PORT=XXX` option includes the following endpoint:

- `POST http://localhost:XXX/post` to submit new orders. Data should contain the order, and the relevant domain descriptor:

```
curl -X POST --header "Content-Type: application/json" --data '{"order":{"app":"0x0000000000000000000000000000000000000000","tag":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"0x0000000000000000000000000000000000000000000000000000000000000002","sign":"0x","trust":"0","params":"","volume":"0","dataset":"0x0000000000000000000000000000000000000000","callback":"0x0000000000000000000000000000000000000000","category":"0","requester":"0x0000000000000000000000000000000000000000","workerpool":"0x0000000000000000000000000000000000000000","appmaxprice":"0","beneficiary":"0x0000000000000000000000000000000000000000","datasetmaxprice":"0","workerpoolmaxprice":"0"},"domain":{"name":"iExecODB","chainId":"1","version":"5.0.0","verifyingContract":"0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f"}}' http://localhost:XXX/post
```

- `GET http://localhost:XXX/hash/:hashprefix?` to retreive a list of all orders which hash start with `hashprefix`. If `hashprefix` is empty, this will return all the orders in the network.

```
curl -X GET http://localhost:3000/hash/0x68332d186f82e507d7a1a7afc01b0053d8953078d55cee1090e581f5c41f73e1
```

- `GET http://localhost:XXX/search/:chainid/:type?fragment` to search for order of type `type` on chain `chainid` that correspond to the given research parameters. Types are `AppOrder`, `DatasetOrder`, `WorkerpoolOrder` and `RequestOrder`

```
curl -X GET "http://localhost:3000/search/1/AppOrder?app=0xa78bf0FF3661b96A97bDd7a1382360fce5F1eFdD&requesterrestrict=0x00x0000000000000000000000000000000000000000"
```


Configuration
---

iExecODBP2P uses [OrbitDB](https://orbitdb.org/). Configuration for IPFS & OrbitDB can be found [here](https://github.com/iExecBlockchainComputing/iexec-p2p-odb/blob/orbit-db/src/config/config.json)

Debug messages can be enable using `DEBUG=iexec-p2p-odb:*`

Future work
---

**This is a prototype.** [OrbitDB](https://orbitdb.org/) is still in development, and the iExecODBP2P network requiers additional security mechanism, not provided by OrbitDB and not yet implemented on top of it.
