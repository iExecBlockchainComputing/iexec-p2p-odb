const express    = require('express')
const bodyParser = require('body-parser')
const withDebug  = require('./utils/withDebug')

class API
{
	constructor()
	{
		this.app = express()
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
		this.debug = withDebug(this)
	}

	static async create(dht, port = 3000)
	{
		return new API().start(dht, port)
	}

	start(dht, port = 3000)
	{
		this.debug(`start (listenning to port ${port})`)
		this.app
		.route('/order/:hash?')
		.get(async (req, res) => {
			this.debug(`get`)
			const result = await dht.database.get(req.params.hash)
			result
				? res.json({ result })
				: res.json({ error: 'no entry found' })
		})
		.post(async (req, res) => {
			this.debug(`post`)
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
		this.app.listen(port)
		return this
	}
}

module.exports = API
