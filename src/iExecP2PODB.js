const { Request    } = require('./tools/types')
const OrderStore     = require('./OrderStore')

const DEFAULT = {
	topic:   '/iexec/odb/5.0.0',
	verbose: false,
}

class iExecP2PODB extends OrderStore
{
	constructor(libp2p, options = {})
	{
		super(options.archive)

		this.libp2p  = libp2p
		this.options = Object.assign(DEFAULT, options)

		this.libp2p.isStarted() && this.onStart()
	}

	onStart()
	{
		// Verbose - identity and ports
		this.options.verbose && console.info(`${this.libp2p.peerId.toB58String()} listening on addresses:`)
		this.options.verbose && console.info(this.libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')

		// Verbose - peer updates
		this.options.verbose && this.libp2p.connectionManager.on('peer:connect', (connection) => {
			console.info(`[peer:connect] connected to ${connection.remotePeer.toB58String()}`)
		})
		this.options.verbose && this.libp2p.connectionManager.on('peer:disconnect', (connection) => {
			console.info(`[peer:disconnect] disconnected from ${connection.remotePeer.toB58String()}`)
		})

		// subscribe to pubsub topic
		this.libp2p.pubsub.subscribe(this.options.topic, (message) => {
			try
			{
				const request = Request.decode(message.data);
				switch (request.type)
				{
					case Request.Type.ORDER:
						this.handleOrder(message, request)
						break
					default:
						// nothing
				}
			}
			catch (err)
			{
				console.error(err)
			}
		})
	}

	onStop()
	{
		this.libp2p.pubsub.unsubscribe(this.topic)
	}

	async handleOrder(message, request)
	{
		(request.order.id in this.orders) || await this.fetchOrder(request.order.id)
	}








	// async send(order)
	// {
	// 	await this.libp2p.pubsub.publish(
	// 		this.topic,
	// 		Request.encode({
	// 			type: Request.Type.BROADCAST_ORDER,
	// 			broadcastOrder: {
	// 				type:   BroadcastOrder.Type.APP_ORDER,
	// 				hash:   Buffer.from("test-hash"),
	// 				domain: Buffer.from("test-domain"),
	// 				order:  Buffer.from("test-order"),
	// 			}
	// 		})
	// 	)
	// }
	//
	// async sendStats(connectedPeers)
	// {
	// 	try
	// 	{
	// 		await this.libp2p.pubsub.publish(
	// 			this.topic,
	// 			Request.encode({
	// 				type: Request.Type.STATS,
	// 				stats: {
	// 					connectedPeers,
	// 					nodeType: Stats.NodeType.NODEJS
	// 				}
	// 			})
	// 		)
	// 	}
	// 	catch (err)
	// 	{
	// 		console.error('Could not publish stats update', err)
	// 	}
	// }



}

module.exports = iExecP2PODB
