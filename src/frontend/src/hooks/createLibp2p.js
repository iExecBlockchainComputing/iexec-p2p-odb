import Libp2p     from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebrtcStar from 'libp2p-webrtc-star'
import Mplex      from 'libp2p-mplex'
import { NOISE }  from 'libp2p-noise'
import Secio      from 'libp2p-secio'
import Bootstrap  from 'libp2p-bootstrap'
import KadDHT     from 'libp2p-kad-dht'
import Gossipsub  from 'libp2p-gossipsub'

export default (opts) => new Libp2p({
	peerId: opts.peerId,
	addresses: {
		listen: [
			'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
			'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
		]
	},
	modules: {
		transport:      [ Websockets, WebrtcStar ],
		streamMuxer:    [ Mplex ],
		connEncryption: [ NOISE, Secio ],
		peerDiscovery:  [ Bootstrap ],
		dht:            KadDHT,
		pubsub:         Gossipsub
	},
	config: {
		peerDiscovery: {
			bootstrap: {
				list: [
					'/dnsaddr/ams-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
					'/dnsaddr/ewr-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
					'/dnsaddr/nrt-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
					'/dnsaddr/sjc-1.bootstrap.libp2p.io/tcp/4001/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
					'/dnsaddr/sjc-2.bootstrap.libp2p.io/tcp/4001/ipfs/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
				]
			}
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
				enabled: true
			}
		}
	}
})
