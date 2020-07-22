const express                         = require('express')
const bodyParser                      = require('body-parser')
const DHT                             = require('./src/DHT')
const { IexecInterface, hash, clean } = require('./src/iexec')
const { MongoDB, MemoryDB }           = require('./src/databases')
const { ethers }                      = require('ethers')


// process.eng.MONGO = 'localhost:27017'


async function main()
{
	// iExec blockchain interface
	const iexecinterface = new IexecInterface()

	// DHT
	const dht = await DHT.create({
		topic: '/iexec/odb/5.0.0',
		database: (process.env.MONGO && new MongoDB(process.env.MONGO)) || (process.env.MEMORY && new MemoryDB()),
		methods:
		{
			hash: (value) => hash(value.domain, value.order),
			isValid: (value) => iexecinterface.isValidOrder(value.domain, value.order),
		}
	})

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


	const app = express()
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	app.route('/order/:hash?')
	.get(async (req, res) => {
		const result = await dht.database.get(req.params.hash)
		result
			? res.json({ result })
			: res.json({ error: 'no entry found' })
	})
	.post(async (req, res) => {
		try
		{
			await dht.new({
				domain: clean(req.body.domain),
				order:  clean(req.body.order),
			})
			res.json({ result: true })
		}
		catch (error)
		{
			res.json({ error: error.message })
		}
	})

	process.env.PORT && app.listen(process.env.PORT)






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
