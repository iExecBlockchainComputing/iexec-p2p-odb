'use strict'

const Libp2p      = require('libp2p')
// Transports
const TCP         = require('libp2p-tcp')
const Websockets  = require('libp2p-websockets')
const WebRTCStar  = require('libp2p-webrtc-star')
const wrtc        = require('wrtc')
// Stream Muxer
const Mplex       = require('libp2p-mplex')
// Connection Encryption
const { NOISE }   = require('libp2p-noise') // default
const Secio       = require('libp2p-secio') // fallback (talk to legacy nodes)
// Peer Discovery
const Bootstrap   = require('libp2p-bootstrap')
const MDNS        = require('libp2p-mdns')
const KadDHT      = require('libp2p-kad-dht')
// PubSub implementation
const Gossipsub   = require('libp2p-gossipsub')
// Addresses
const multiaddr   = require('multiaddr')



const { ethers }  = require('ethers')
const iExecP2PODB = require('./src/iExecP2PODB')



async function main()
{
	// create p2p layer
	const libp2p = await Libp2p.create({
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

	// start p2p layer
	await libp2p.start()

	// start iExecP2PODB service
	const iexecp2podb = new iExecP2PODB(libp2p, { verbose: true })

	// Set up our input handler
	process.stdin.on('data', async (message) => {
		try
		{
			iexecp2podb.broadcastOrder({
				name:              'iExecODB',
				version:           '5.0.0',
				chainId:           1,
				verifyingContract: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f',
			},{
				dataset:            ethers.constants.AddressZero,
				datasetprice:       0,
				volume:             0,
				tag:                ethers.constants.HashZero,
				apprestrict:        ethers.constants.AddressZero,
				workerpoolrestrict: ethers.constants.AddressZero,
				requesterrestrict:  ethers.constants.AddressZero,
				salt:               ethers.utils.hexlify(ethers.utils.randomBytes(32)),
			})
		}
		catch (err)
		{
			console.error('Could not publish chat', err)
		}
	})
}


main().catch(console.error)
