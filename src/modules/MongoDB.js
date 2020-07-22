const Module      = require('./common/Module')
const MongoClient = require('mongodb').MongoClient;

class MongoDB extends Module
{
	constructor(parent, params = {})
	{
		super(parent, params)
		this.client = new MongoClient(`mongodb://${params.url}`, { useUnifiedTopology: true })
	}

	async start()
	{
		this.debug(`start`)
		await this.client.connect()
		this.data = this.client.db('iExec-P2P-ODB').collection('orders')
	}

	async stop()
	{
		this.debug(`stop`)
		await this.client.close()
	}

	async get(_id)
	{
		this.debug(`get ${_id}`)
		return await this.data.findOne({ _id })
	}

	async put(_id, value)
	{
		this.debug(`put ${_id}`)
		await this.data.updateOne({ _id }, { $set: value }, { upsert: true })
	}

	async remove(_id)
	{
		this.debug(`remove ${_id}`)
		return await this.data.deleteOne({ _id })
	}
}

module.exports  = MongoDB
