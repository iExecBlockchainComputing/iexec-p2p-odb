const Libp2p       = require('libp2p')
// Transports
const TCP          = require('libp2p-tcp')
const Websockets   = require('libp2p-websockets')
const WebRTCStar   = require('libp2p-webrtc-star')
const wrtc         = require('wrtc')
// Stream Muxer
const Mplex        = require('libp2p-mplex')
// Connection Encryption
const { NOISE }    = require('libp2p-noise') // default
const Secio        = require('libp2p-secio') // fallback (talk to legacy nodes)
// Peer Discovery
const Bootstrap    = require('libp2p-bootstrap')
const MDNS         = require('libp2p-mdns')
const KadDHT       = require('libp2p-kad-dht')
// PubSub implementation
const Gossipsub    = require('libp2p-gossipsub')
// Addresses
const multiaddr    = require('multiaddr')

// Modules
const Interactions = require('./modules/Interactions')
const Listener     = require('./modules/Listener')
const MemoryDB     = require('./modules/MemoryDB')

// Utilities
const { ethers }   = require('ethers')
const PeerId       = require('peer-id')
const DefaultsDeep = require('@nodeutils/defaults-deep')
const utils        = require('./utils')



const DEFAULT = {
	topic:  '/iexec/odb/5.0.0',
	modules: {
		interactions: { type: Interactions },
		listener:     { type: Listener     },
		database:     { type: MemoryDB     },
	}
}



class Core extends Libp2p
{
	constructor(peerId, options = {})
	{
		super({
			peerId,
			addresses: {
				listen: [
					'/ip4/0.0.0.0/tcp/0',
					'/ip4/0.0.0.0/tcp/0/ws',
					// '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
				]
			},
			modules: {
				transport:      [ TCP, Websockets, /*WebRTCStar*/ ],
				streamMuxer:    [ Mplex ],
				connEncryption: [ NOISE, Secio ],
				peerDiscovery:  [ /*Bootstrap,*/ MDNS ],
				dht:            KadDHT,
				pubsub:         Gossipsub,
			},
			config: {
				// transport: {
				// 	[WebRTCStar.prototype[Symbol.toStringTag]]: { wrtc },
				// },
				// peerDiscovery: {
				// 	bootstrap: {
				// 		// Get list of bootstrap nodes by running `dig -t TXT _dnsaddr.bootstrap.libp2p.io`
				// 		list: [
				// 			'/dnsaddr/ams-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
				// 			'/dnsaddr/ewr-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
				// 			'/dnsaddr/nrt-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
				// 			'/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
				// 			'/dnsaddr/sjc-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
				// 		],
				// 	},
				// },
				dht: {
					enabled: true,
					randomWalk: {
						enabled: true,
					},
				},
			},
		})

		// options & debug
		this.options = DefaultsDeep(options, DEFAULT)
		this.debug   = utils.debug(this, this.peerId.toB58String())
		this.modules = Object.entries(this.options.modules).reduce((acc, [ name, entry ]) => {
			this.debug(`instanciating module ${name}`)
			const module = new entry.type(this, entry)
			return { ...acc, [name]: module }
		}, {})
	}

	static async create(options = {})
	{
		return new Core(options.peerId || await PeerId.create(), options).start()
	}

	async start()
	{
		this.debug('start')
		await super.start()
		await Promise.all(Object.values(this.modules).map(module => module.start()))

		// start logging
		this.debug(`${this.peerId.toB58String()} listening on addresses:`)
		this.debug(this.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')
		this.connectionManager.on('peer:connect',    ({ remotePeer }) => this.debug(`[peer:connect] connected to ${remotePeer.toB58String()}`))
		this.connectionManager.on('peer:disconnect', ({ remotePeer }) => this.debug(`[peer:disconnect] disconnected from ${remotePeer.toB58String()}`))

		// start services
		this.pubsub.subscribe(this.options.topic, async (message) => {
			try
			{
				const request = utils.types.Request.decode(message.data);
				switch (request.type)
				{
					case utils.types.Request.Type.ORDER:
					{
						const domain = JSON.parse(request.order.domain.toString())
						const order  = JSON.parse(request.order.order.toString())
						const hash   = utils.orders.hash(domain, order)
						if (await this.modules.listener.isValidOrder(domain, order))
						{
							await this.modules.database.put(
								hash,
								{
									hash,
									domain,
									order,
									type: request.order.type
								}
							)
						}
						break
					}
					case utils.types.Request.Type.NOTICE:
					{
						const hash              = ethers.utils.hexlify(request.notice.id)
						const { domain, order } = await this.modules.database.get(hash)
						if (await this.modules.listener.shouldGarbageCollect(hash))
						{
							await this.modules.database.remove(hash)
						}
						break
					}
					default:
						// nothing
				}
			}
			catch (err)
			{
				this.debug('ERROR', err)
			}
		})

		return this
	}

	async stop()
	{
		this.debug('stop')
		await Promise.all(Object.values(this.modules).map(module => module.stop()))
		await super.stop()

		this.pubsub.unsubscribe(this.options.topic)
	}
}

module.exports = Core
