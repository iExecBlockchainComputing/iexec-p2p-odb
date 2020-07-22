const { MongoClient } = require('mongodb');
const withDebug = require('../utils/withDebug')

class MongoDB
{
	constructor(options = {})
	{
		this.client     = new MongoClient(`mongodb://${options.url}`, { useUnifiedTopology: true })
		this.db         = options.db
		this.collection = options.collection
		this.debug      = withDebug(this)
	}

	async start()
	{
		this.debug(`start`)
		await this.client.connect()
		this.data = this.client.db(this.db).collection(this.collection)
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

module.exports = MongoDB
