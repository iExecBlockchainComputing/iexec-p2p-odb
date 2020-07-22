const Module         = require('./common/Module')

const { ethers }     = require('ethers')
const IexecInterface = require('@iexec/poco/build/contracts-min/IexecInterfaceToken.json')
const utils          = require('../utils')

class Listener extends Module
{
	constructor(parent, params = {})
	{
		super(parent, params)
		this.contracts = (params.chains || []).reduce((acc, chainId) => ({ [chainId]: new ethers.Contract('0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f', IexecInterface.abi, ethers.getDefaultProvider(chainId)), ...acc }), {})
	}

	async start()
	{
		this.debug(`start`)
		await Promise.all(
			Object.values(this.contracts).map(async contract => {
				const domain = utils.orders.clean(await contract.domain())
				contract.on(contract.filters.BroadcastAppOrder(),        this.handleBroadcast.bind(this, domain))
				contract.on(contract.filters.BroadcastDatasetOrder(),    this.handleBroadcast.bind(this, domain))
				contract.on(contract.filters.BroadcastRequestOrder(),    this.handleBroadcast.bind(this, domain))
				contract.on(contract.filters.BroadcastWorkerpoolOrder(), this.handleBroadcast.bind(this, domain))
				contract.on(contract.filters.ClosedAppOrder(),           this.handleClose.bind(this))
				contract.on(contract.filters.ClosedDatasetOrder(),       this.handleClose.bind(this))
				contract.on(contract.filters.ClosedWorkerpoolOrder(),    this.handleClose.bind(this))
				contract.on(contract.filters.ClosedRequestOrder(),       this.handleClose.bind(this))
				contract.on(contract.filters.OrdersMatched(),            this.handleMatch.bind(this));
				// (await contract.queryFilter(contract.filters.OrdersMatched())).forEach(({ args }) => this.handleMatch(...args))
			})
		)
	}

	async stop()
	{
		this.debug(`stop`)
		Object.values(this.contracts).forEach(contract => contract.removeAllListeners())
	}

	// React to events
	async handleBroadcast(domain, order)
	{
		this.debug(`${this.constructor.name}:handleBroadcast`)
		await this.parent.modules.interactions.pushOrder(domain, utils.orders.clean(order))
	}

	async handleClose(hash)
	{
		this.debug(`${this.constructor.name}:handleClose`)
		await this.parent.modules.interactions.pushUpdate(hash)
	}

	async handleMatch(dealid, appHash, datasetHash, workerpoolHash, requestHash, volume)
	{
		this.debug(`${this.constructor.name}:handleMatch`)
		await this.shouldGarbageCollect(appHash)        && this.handleClose(appHash)
		await this.shouldGarbageCollect(datasetHash)    && this.handleClose(datasetHash)
		await this.shouldGarbageCollect(workerpoolHash) && this.handleClose(workerpoolHash)
		await this.shouldGarbageCollect(requestHash)    && this.handleClose(requestHash)
	}

	// garbage collection
	async isValidOrder(domain, order)
	{
		this.debug(`${this.constructor.name}:isValidOrder`)
		return (domain.chainId in this.contracts) && (await this.contracts[domain.chainId].viewConsumed(utils.orders.hash(domain, order))).lt(order.volume);
	}

	async shouldGarbageCollect(hash)
	{
		this.debug(`${this.constructor.name}:shouldGarbageCollect`)
		const entry = await this.parent.modules.database.get(hash)
		return entry && !(await this.isValidOrder(entry.domain, entry.order))
	}
}

module.exports = Listener
