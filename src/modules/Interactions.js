const Module      = require('./common/Module')
const { ethers }  = require('ethers')
const utils       = require('../utils')

class Interactions extends Module
{
	async start()
	{
		this.debug(`start`)
	}

	async stop()
	{
		this.debug(`stop`)
	}

	async broadcast(message)
	{
		return await this.parent.pubsub.publish(this.options.topic, message)
	}

	async pushOrder(domain, order)
	{
		// verbose
		this.debug(`pushOrder ${JSON.stringify(order)}`)
		// metadata
		const type = utils.orders.type(order)
		// broadcast order
		await this.broadcast(utils.types.Request.encode({
			type: utils.types.Request.Type.ORDER,
			order: {
				domain: Buffer.from(JSON.stringify(domain)),
				order:  Buffer.from(JSON.stringify(order)),
				type
			}
		}))
	}

	async pushUpdate(hash)
	{
		// verbose
		this.debug(`pushUpdate ${hash}`)
		// broadcast notification
		await this.broadcast(utils.types.Request.encode({
			type: utils.types.Request.Type.NOTICE,
			notice: {
				id: ethers.utils.arrayify(hash),
			}
		}))
	}
}

module.exports = Interactions
