'use strict'

const express     = require('express')
const bodyParser  = require('body-parser')
const IexecODBP2P = require('./src/iexecodbp2p')
const liborders   = require('./src/utils/liborders')

async function main()
{
	// IexecODBP2P
	const instance = await IexecODBP2P.create({ listen: process.env.LISTEN })

	// Rest API
	const app = express()
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	// → post endpoint
	app.route('/post')
	.post(async (req, res) => {
		try
		{
			const domain = liborders.clean(req.body.domain, false) // withSign: false
			const order  = liborders.clean(req.body.order, true) // withSign: true
			const hash   = liborders.hash(domain, order)
			const type   = liborders.type(order)
			await instance.datastore.db.put({ hash, type, domain, order })
			res.json({ result: true })
		}
		catch (error)
		{
			res.json({ error: error.message })
		}
	})

	// → get by hash
	app.route('/hash/:hash')
	.get(async (req, res) => {
		try
		{
			res.json({ result: instance.datastore.db.get(req.params.hash) })
		}
		catch (error)
		{
			res.json({ error: error.message })
		}
	})

	// → search
	app.route('/search/:chainId/:type')
	.get(async (req, res) => {
		try
		{
			res.json({
				result: instance.datastore.db.query((entry => [
					entry.domain.chainId == req.params.chainId,                                     // check chainid
					entry.type           == req.params.type,                                        // check order type
					...Object.entries(req.query).map(([ key, value ]) => entry.order[key] == value) // check search parameters
				].every(Boolean)))
			})
		}
		catch (error)
		{
			res.json({ error: error.message })
		}
	})

	process.env.PORT && app.listen(process.env.PORT)

	// Show current content
	process.stdin.on('data', () => {
		const orders = instance.datastore.db.query((entry) => true)
		console.log(`${orders.length} orders stored`)
		orders.forEach(({ hash }) => console.log(`- ${hash} - `))
	})
}


main()
