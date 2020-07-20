const { Request } = require('./tools/types')
const liborder  = require('./tools/liborder')

class OrderStore
{
	constructor(archive = true)
	{
		this.orders = archive && new Map()
		console.log('archive', archive)
	}

	addOrder(id, type, domain, order)
	{
		if (this.orders) this.orders[id] = { type, domain, order}
	}

	removeOrder(id)
	{
		if (this.orders) delete this.orders[id]
	}

	async fetchOrder(id, libp2p = this.libp2p)
	{
		// fetch
		const { type, domain, order } = JSON.parse(await libp2p.contentRouting.get(id))
		//store
		this.addOrder(id, type, domain, order)
		// verbose
		console.log('order fetched:', id.toString('hex'))
		// return
		return { type, domain, order }
	}

	async broadcastOrder(domain, order, libp2p = this.libp2p, topic = this.options.topic)
	{
		// metadata
		const type = liborder.type(order)
		const id   = liborder.hash(type, domain, order)
		// store
		this.addOrder(id, type, domain, order)
		// publish and advertize
		await libp2p.contentRouting.put(id, Buffer.from(JSON.stringify({ type, domain, order }))) // same as this.orders[id]
		await libp2p.pubsub.publish(topic, Request.encode({ type: Request.Type.ORDER, order: { id, type } }))
		// verbose
		console.log('order broadcasted:', id.toString('hex'))
	}
}

module.exports = OrderStore
