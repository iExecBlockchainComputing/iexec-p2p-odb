import React            from 'react';
import IPFS             from 'ipfs';
import OrbitDB          from 'orbit-db';
import Container        from '@material-ui/core/Container';
import createLibp2p     from './hooks/createLibp2p'
import useTimer         from './hooks/useTimer'
import Loading          from './components/Loading';
import CollapsableAlert from './components/CollapsableAlert';
import OrderList        from './components/OrderList';

const App = (props) =>
{
	const [ ipfs,     setIpfs    ] = React.useState(null)
	const [ orbitdb,  setOrbitdb ] = React.useState(null);
	const [ db,       setDB      ] = React.useState(null);
	const [ data,     setData    ] = React.useState([]);
	const { start, stop, duration } = useTimer();

	React.useEffect(() => {
		start()
		IPFS.create({ libp2p: createLibp2p }).then(setIpfs)
	}, []);

	React.useEffect(() => {
		if (ipfs)
		{
			console.info(`${ipfs.libp2p.peerId.toB58String()} listening on addresses:`)
			console.info(ipfs.libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')
			ipfs.libp2p.connectionManager.on('peer:connect',    ({ remotePeer }) => console.info(`[peer:connect] connected to ${remotePeer.toB58String()}`))
			ipfs.libp2p.connectionManager.on('peer:disconnect', ({ remotePeer }) => console.info(`[peer:disconnect] disconnected from ${remotePeer.toB58String()}`))
			OrbitDB.createInstance(ipfs).then(setOrbitdb)
		}
	}, [ ipfs ])

	React.useEffect(() => {
		if (orbitdb)
		{
			orbitdb.open('odb/5.0.0/p2p', {
				create: true,
				overwrite: false,
				localOnly: false,
				type: 'docstore',
				indexBy: 'hash',
				accessController: { write: ['*'] },
			}).then(setDB)
		}
	}, [ orbitdb ])

	React.useEffect(() => {
		const interval = setInterval(() => db && setData(db.get('')), 1000)
		return () => clearInterval(interval)
	}, [ db ]);

	React.useEffect(() => {
		data.length && stop()
	}, [ data ])

	return (
		<>
			{
				Boolean(!db) &&
				<Loading message='Connecting ...'/>
			}
			{
				Boolean(db && !data.length) &&
				<Loading message='Fetching data from network...'/>
			}
			{
				Boolean(db && data.length) &&
				<>
					<CollapsableAlert title='Connection to iExecODBP2P established' text={`Data loaded in ${ duration / 1000 } secondes`}/>
					<Container>
						<OrderList
							entries = { data }
							delete  = { ({ hash }) => db.del(hash) }
						/>
					</Container>
				</>
			}
		</>
	);
}

export default App;
