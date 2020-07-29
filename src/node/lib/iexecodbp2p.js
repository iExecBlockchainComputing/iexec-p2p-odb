'use strict'

const PocoInterface = require('./pocointerface')
const Datastore     = require('./datastore')
const liborders     = require('./utils/liborders')

class IexecODBP2P extends PocoInterface
{
	static async create(options = {})
	{
		return await (new IexecODBP2P(options)).start()
	}

	async start()
	{
		this.datastore = await Datastore.create(this.options.datastore)
		await super.start()
		return this
	}

	async handleBroadcast(contract, dirtyOrder)
	{
		super.handleBroadcast()
		const domain = liborders.clean(await contract.domain(), false) // withSign: false
		const order  = liborders.clean(dirtyOrder, true) // withSign: true
		const hash   = liborders.hash(domain, order)
		const type   = liborders.type(order)
		/* await */ this.datastore.db.put({ hash, type, domain, order })
	}

	async handleClose(contract, hash)
	{
		super.handleClose()
		/* await */ this.datastore.db.del(hash)
	}

	async handleMatch(contract, dealid, appHash, datasetHash, workerpoolHash, requestHash, volume)
	{
		super.handleMatch()
		await this.shouldGarbageCollect(appHash)        && /* await */ handleClose(contract, appHash)
		await this.shouldGarbageCollect(datasetHash)    && /* await */ handleClose(contract, datasetHash)
		await this.shouldGarbageCollect(workerpoolHash) && /* await */ handleClose(contract, workerpoolHash)
		await this.shouldGarbageCollect(requestHash)    && /* await */ handleClose(contract, requestHash)
	}

	// utils
	async shouldGarbageCollect(hash)
	{
		this.debug(`shouldGarbageCollect`)
		const entry = this.datastore.db.get(hash).find(Boolean)
		return entry && !await this.isValidOrder(entry.domain, entry.order)
	}
}

module.exports = IexecODBP2P
