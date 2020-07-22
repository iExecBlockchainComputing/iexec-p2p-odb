const API                             = require('./src/API')
const DHT                             = require('./src/DHT')
const { IexecInterface, hash, clean } = require('./src/iexec')
const { MongoDB, MemoryDB }           = require('./src/databases')
const { ethers }                      = require('ethers')

async function main()
{
	// iExec blockchain interface
	const iexecinterface = new IexecInterface()

	// DHT
	const dht = await DHT.create({
		topic: '/iexec/odb/5.0.0',
		database: (process.env.MONGO && new MongoDB({ url: process.env.MONGO, db: 'iExec-P2P-ODB', collection: 'orders' })) || (process.env.MEMORY && new MemoryDB()),
		methods:
		{
			hash: (value) => hash(value.domain, value.order),
			isValid: (value) => iexecinterface.isValidOrder(value.domain, value.order),
		}
	})

	// RestAPI
	const api = await API.create(dht, process.env.PORT)

	// start listenning to blockchain events
	process.env.LISTEN && await iexecinterface.startListener({
		handleBroadcast:
			async (domain, order) => {
				iexecinterface.debug('handleBroadcast')
				await dht.new({ domain, order: clean(order) })
			},

		handleClose:
			async (hash) => {
				iexecinterface.debug('handleClose')
				await this.dht.update(hash)
			},

		handleMatch:
			async (dealid, appHash, datasetHash, workerpoolHash, requestHash, volume) => {
				iexecinterface.debug('handleMatch')
				await this.dht.update(appHash)
				await this.dht.update(datasetHash)
				await this.dht.update(workerpoolHash)
				await this.dht.update(requestHash)
			},
	})


	process.stdin.on('data', async (message) => {
		try
		{
			dht.new({
				domain: {
					name:              'iExecODB',
					version:           '5.0.0',
					chainId:           1,
					verifyingContract: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f',
				},
				order: {
					dataset:            ethers.constants.AddressZero,
					datasetprice:       0,
					volume:             1,
					tag:                ethers.constants.HashZero,
					apprestrict:        ethers.constants.AddressZero,
					workerpoolrestrict: ethers.constants.AddressZero,
					requesterrestrict:  ethers.constants.AddressZero,
					salt:               ethers.utils.hexlify(ethers.utils.randomBytes(32)),
				}
			})
		}
		catch (err)
		{
			console.error(err)
		}
	})
}


main().catch(console.error)
