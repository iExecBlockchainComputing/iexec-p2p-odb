'use strict'

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
// utils
const defaultsDeep = require('defaults-deep')

module.exports = (config, opts) => new Libp2p(defaultsDeep(
	config,
	{
		peerId: opts.peerId,
		modules: {
			transport:      [ TCP, Websockets, WebRTCStar ],
			streamMuxer:    [ Mplex ],
			connEncryption: [ NOISE, Secio ],
			peerDiscovery:  [ Bootstrap, MDNS ],
			dht:            KadDHT,
			pubsub:         Gossipsub,
		},
		config: {
			transport: {
				[WebRTCStar.prototype[Symbol.toStringTag]]: { wrtc },
			},
			peerDiscovery: {
				bootstrap: {
					// Get list of bootstrap nodes by running `dig -t TXT _dnsaddr.bootstrap.libp2p.io`
					list: [
						'/dnsaddr/ams-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
						'/dnsaddr/ewr-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
						'/dnsaddr/nrt-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
						'/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
						'/dnsaddr/sjc-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
					],
				},
			},
			relay: {
				enabled: true,
				hop: {
					enabled: true,
					active: false
				}
			},
			dht: {
				enabled: true,
				randomWalk: {
					enabled: true,
				},
			},
		}
	}
))
