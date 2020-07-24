'use strict'

const { ethers } = require('ethers')
const withDebug  = require('./utils/withDebug')

class BlockchainInterface
{
	constructor(abi, chains = [])
	{
		this.contracts = chains.reduce((acc, { provider, address }) => ({ [[ provider._network.chainId, address.toLowerCase() ]]: new ethers.Contract(address, abi, provider), ...acc }), {})
		this.debug     = withDebug(this)
	}

	async startListener(callbacks = [])
	{
		this.debug(`startListener`)
		await Promise.all(
			Object.values(this.contracts).map(contract =>
				Promise.all(
					callbacks.map(async ({ event, callback }) => contract.on(contract.filters[event](), callback.bind(null, contract)))
				)
			)
		)
	}

	async stopListener()
	{
		this.debug(`stopListener`)
		Object.values(this.contracts).forEach(contract => contract.removeAllListeners())
	}
}

module.exports = BlockchainInterface
