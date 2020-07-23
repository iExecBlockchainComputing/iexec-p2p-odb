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

	app.route('/order/:hash?')
	.get(async (req, res) => {
		const result = instance.datastore.db.get(req.params.hash)
		result
			? res.json({ result })
			: res.json({ error: 'no entry found' })
	})
	.post(async (req, res) => {
		try
		{
			const domain = liborders.clean(req.body.domain, false) // withSign: false
			const order  = liborders.clean(req.body.order, true) // withSign: true
			const hash   = liborders.hash(domain, order)
			await instance.datastore.db.put({ hash, domain, order })
			res.json({ result: true })
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
