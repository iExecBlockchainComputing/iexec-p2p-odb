'use strict'

const { ethers }          = require('ethers')
const { abi }             = require('@iexec/poco/build/contracts-min/IexecInterfaceToken.json')
const BlockchainInterface = require('./blockchaininterface')
const liborders           = require('./utils/liborders')

class PocoInterface extends BlockchainInterface
{
	constructor(options = {})
	{
		super(
			abi,
			[
				{ provider: ethers.getDefaultProvider('mainnet'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
				{ provider: ethers.getDefaultProvider('ropsten'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
				{ provider: ethers.getDefaultProvider('rinkeby'),  address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
				{ provider: ethers.getDefaultProvider('goerli'),   address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
				{ provider: ethers.getDefaultProvider('kovan'),    address: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f' },
			]
		)
		this.options = options
	}

	static async create(options = {})
	{
		return await (new PocoInterface(options)).start()
	}

	async start()
	{
		this.options.listen && this.startListener([
			{ event: 'BroadcastAppOrder((address,uint256,uint256,bytes32,address,address,address,bytes32,bytes))',                                                            callback: this.handleBroadcast.bind(this) },
			{ event: 'BroadcastDatasetOrder((address,uint256,uint256,bytes32,address,address,address,bytes32,bytes))',                                                        callback: this.handleBroadcast.bind(this) },
			{ event: 'BroadcastWorkerpoolOrder((address,uint256,uint256,bytes32,uint256,uint256,address,address,address,bytes32,bytes))',                                     callback: this.handleBroadcast.bind(this) },
			{ event: 'BroadcastRequestOrder((address,uint256,address,uint256,address,uint256,address,uint256,bytes32,uint256,uint256,address,address,string,bytes32,bytes))', callback: this.handleBroadcast.bind(this) },
			{ event: 'ClosedAppOrder(bytes32)',                                                                                                                               callback: this.handleClose.bind(this)     },
			{ event: 'ClosedDatasetOrder(bytes32)',                                                                                                                           callback: this.handleClose.bind(this)     },
			{ event: 'ClosedWorkerpoolOrder(bytes32)',                                                                                                                        callback: this.handleClose.bind(this)     },
			{ event: 'ClosedRequestOrder(bytes32)',                                                                                                                           callback: this.handleClose.bind(this)     },
			{ event: 'OrdersMatched(bytes32,bytes32,bytes32,bytes32,bytes32,uint256)',                                                                                        callback: this.handleMatch.bind(this)     },
		])
		return this
	}

	async handleBroadcast(contract, order)
	{
		this.debug(`handleBroadcast`)
	}

	async handleClose(contract, hash)
	{
		this.debug(`handleClose`)
	}

	async handleMatch(contract, dealid, appHash, datasetHash, workerpoolHash, requestHash, volume)
	{
		this.debug(`handleMatch`)
	}

	// utils
	async isValidOrder(domain, order)
	{
		this.debug(`isValidOrder`)
		return (domain.chainId in this.contracts) && (await this.contracts[domain.chainId].viewConsumed(liborders.hash(domain, order))).lt(order.volume)
	}
}

module.exports = PocoInterface
