const Module = require('./common/Module')

class MemoryDB extends Module
{
	constructor(parent, params = {})
	{
		super(parent, params)
		this.data  = new Map()
	}

	async start()
	{
		this.debug(`start`)
	}

	async stop()
	{
		this.debug(`stop`)
	}

	async get(key)
	{
		this.debug(`get ${key}`)
		return this.data[key]
	}

	async put(key, value)
	{
		this.debug(`put ${key}`)
		this.data[key] = value
	}

	async remove(key)
	{
		this.debug(`remove ${key}`)
		delete this.data[key]
	}
}

module.exports = MemoryDB
