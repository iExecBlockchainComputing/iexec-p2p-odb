import React   from 'react';
import IPFS    from 'ipfs';
import OrbitDB from 'orbit-db';

// import Libp2p from 'libp2p'
// import Websockets from 'libp2p-websockets'
// import WebRTCStar from 'libp2p-webrtc-star'
// import { NOISE } from 'libp2p-noise'
// import Secio from 'libp2p-secio'
// import Mplex from 'libp2p-mplex'
// import Boostrap from 'libp2p-bootstrap'

const App = (props) =>
{
	// const [ libp2p,   setLibp2p  ] = React.useState(null);
	const [ orbitdb,  setOrbitdb  ] = React.useState(null);
	const [ database, setDatabase ] = React.useState(null);

	React.useEffect(() => {
		IPFS.create({
			start: true,
			preload: {
				enabled: false
			},
			config: {
				Addresses: {
					Swarm: [
						'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
						'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
						// '/ip4/127.0.0.1/tcp/13579/wss/p2p-webrtc-star'
					]
				}
			},
			Boostrap: [
				'/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
				'/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
				'/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
				'/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
				'/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
				'/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64'
			],
			EXPERIMENTAL: {
				pubsub: true
			}
		}).then(ipfs =>OrbitDB.createInstance(ipfs).then(setOrbitdb))
	}, []);


	React.useEffect(() => {
		orbitdb && orbitdb.open('odb/5.0.0/p2p', {
			create: true,
			overwrite: false,
			localOnly: false,
			type: 'docstore',
			indexBy: 'hash',
			accessController: { write: ['*'] },
		}).then(setDatabase)
	}, [ orbitdb ])

	React.useEffect(() => {
		database && console.log(Object.keys(database))
	}, [ database ])

	return null;
}

export default App;
