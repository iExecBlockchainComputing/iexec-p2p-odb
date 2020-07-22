const Libp2p       = require('libp2p')
const peerId       = require('peer-id')
const defaultsDeep = require('@nodeutils/defaults-deep')
const { Request }  = require('./utils/request')
const withDebug    = require('./utils/withDebug')
const SETTINGS     = require('./libp2p-settings')

class DHT extends Libp2p
{
	constructor(peerId, options = {})
	{
		super(defaultsDeep({ peerId }, SETTINGS))

		this.options = defaultsDeep(
			options,
			{
				topic: '',
				methods:
				{
					hash:    () => { throw Error('missing hash method')    },
					isValid: () => { throw Error('missing isValid method') },
				},
			}
		)
		this.database = this.options.database
		this.topic    = `${this.options.topic}/dht`
		this.debug    = withDebug(this)
	}

	static async create(options = {})
	{
		return new DHT(options.peerId || await peerId.create(), options).start()
	}

	async start()
	{
		this.debug(`start`)
		await super.start()
		this.database && await this.database.start()

		this.debug(`${this.peerId.toB58String()} listening on addresses:`)
		this.debug(this.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')
		this.connectionManager.on('peer:connect',    ({ remotePeer }) => this.debug(`[peer:connect] connected to ${remotePeer.toB58String()}`))
		this.connectionManager.on('peer:disconnect', ({ remotePeer }) => this.debug(`[peer:disconnect] disconnected from ${remotePeer.toB58String()}`))

		this.pubsub.subscribe(this.topic, async (message) => {
			try
			{
				const request = Request.decode(message.data);
				switch (request.type)
				{
					case Request.Type.NEW:
					{
						this.debug(`received NEW message`)
						const value = JSON.parse(request.value.toString())
						const key   = this.options.methods.hash(value)
						if (await this.options.methods.isValid(value))
						{
							this.database && await this.database.put(key, value)
						}
						break
					}
					case Request.Type.UPDATE:
					{
						this.debug(`received UPDATE message`)
						const key   = request.notice.id.toString()
						const value = await this.database.get(key)
						if (value && !(await this.options.methods.isValid(value)))
						{
							this.database && await this.database.remove(key)
						}
						break
					}
				}
			}
			catch (err)
			{
				this.debug(err)
			}
		})
		return this
	}

	async stop()
	{
		this.debug(`stop`)
		this.pubsub.unsubscribe(this.topic)
		this.database && await this.database.stop()
		await super.stop()
	}

	async new(value)
	{
		this.debug(`new`)
		await this.pubsub.publish(
			this.topic,
			Request.encode({
				type:  Request.Type.NEW,
				value: Buffer.from(JSON.stringify(value))
			})
		)
	}

	async update(key)
	{
		this.debug(`update`)
		await this.pubsub.publish(
			this.topic,
			Request.encode({
				type: Request.Type.UPDATE,
				key:  Buffer.from(key)
			})
		)
	}
}

module.exports = DHT
