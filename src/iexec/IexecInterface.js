const { ethers } = require('ethers')
const { abi }    = require('@iexec/poco/build/contracts-min/IexecInterfaceToken.json')
const liborders  = require('./liborders')
const withDebug  = require('../utils/withDebug')

class IexecInterface
{
	constructor(chains = [
		{ provider: ethers.getDefaultProvider('mainnet'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
		{ provider: ethers.getDefaultProvider('ropsten'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
		{ provider: ethers.getDefaultProvider('rinkeby'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
		{ provider: ethers.getDefaultProvider('goerli'),   address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
		{ provider: ethers.getDefaultProvider('kovan'),    address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
	])
	{
		this.contracts = chains.reduce((acc, { provider, address }) => ({ [provider._network.chainId]: new ethers.Contract(address, abi, provider), ...acc }), {})
		this.debug     = withDebug(this)
	}

	async startListener(callbacks)
	{
		this.debug(`startListener`)
		await Promise.all(
			Object.values(this.contracts).map(async contract => {
				const domain = liborders.clean(await contract.domain())
				callbacks.handleBroadcast && contract.on(contract.filters.BroadcastAppOrder(),        callbacks.handleBroadcast.bind(this, domain))
				callbacks.handleBroadcast && contract.on(contract.filters.BroadcastDatasetOrder(),    callbacks.handleBroadcast.bind(this, domain))
				callbacks.handleBroadcast && contract.on(contract.filters.BroadcastRequestOrder(),    callbacks.handleBroadcast.bind(this, domain))
				callbacks.handleBroadcast && contract.on(contract.filters.BroadcastWorkerpoolOrder(), callbacks.handleBroadcast.bind(this, domain))
				callbacks.handleClose     && contract.on(contract.filters.ClosedAppOrder(),           callbacks.handleClose.bind(this))
				callbacks.handleClose     && contract.on(contract.filters.ClosedDatasetOrder(),       callbacks.handleClose.bind(this))
				callbacks.handleClose     && contract.on(contract.filters.ClosedWorkerpoolOrder(),    callbacks.handleClose.bind(this))
				callbacks.handleClose     && contract.on(contract.filters.ClosedRequestOrder(),       callbacks.handleClose.bind(this))
				callbacks.handleMatch     && contract.on(contract.filters.OrdersMatched(),            callbacks.handleMatch.bind(this))
			})
		)
	}

	async stopListener()
	{
		this.debug(`stopListener`)
		Object.values(this.contracts).forEach(contract => contract.removeAllListeners())
	}

	async isValidOrder(domain, order)
	{
		this.debug(`isValidOrder`)
		return (domain.chainId in this.contracts) && (await this.contracts[domain.chainId].viewConsumed(liborders.hash(domain, order))).lt(order.volume)
	}
}

module.exports = IexecInterface
