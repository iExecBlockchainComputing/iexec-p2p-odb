import React            from 'react';
import IPFS             from 'ipfs';
import OrbitDB          from 'orbit-db';

import Container        from 'react-bootstrap/Container';
import AddToPhotosIcon  from '@material-ui/icons/AddToPhotos';

import createLibp2p     from './hooks/createLibp2p'
import useTimer         from './hooks/useTimer'
import useView          from './hooks/useView';

import liborders        from './utils/liborders';

import Loading          from './components/Loading';
import UploadModal      from './components/UploadModal';
import CollapsableAlert from './components/CollapsableAlert';
import OrderList        from './components/OrderList';
import SpeedDials       from './components/SpeedDials';



const App = (props) =>
{
	const [ ipfs,    setIpfs    ] = React.useState(null);
	const [ orbitdb, setOrbitdb ] = React.useState(null);
	const [ db,      setDB      ] = React.useState(null);
	const [ data,    setData    ] = React.useState([]);
	const timer      = useTimer();
	const viewUpload = useView();

	React.useEffect(() => {
		timer.start()
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
		data.length && timer.stop()
	}, [ data ])

	const handleSubmit = ({ domain, order }) => {
		domain     = liborders.clean(JSON.parse(domain), false) // withSign: false
		order      = liborders.clean(JSON.parse(order), true) // withSign: true
		db && db.put({
			hash: liborders.hash(domain, order),
			type: liborders.type(order),
			domain,
			order,
		}).then(viewUpload.hide)
	}

	return (
		<>
			<UploadModal
				view   = { viewUpload }
				submit = { handleSubmit }
			/>
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
					<CollapsableAlert variant='success'>
						<strong>Connection to iExecODBP2P established.</strong> Data loaded in { timer.duration / 1000 } secondes
					</CollapsableAlert>

					<Container>
						<OrderList entries = { data }/>
					</Container>
					<SpeedDials
						actions={[
							{ icon: <AddToPhotosIcon/>, name: 'Upload', fun: () => viewUpload.show() },
							// { icon: <SaveIcon />,     name: 'Save' },
							// { icon: <PrintIcon />,    name: 'Print' },
							// { icon: <ShareIcon />,    name: 'Share' },
							// { icon: <FavoriteIcon />, name: 'Like' },
						]}
					/>
				</>
			}
		</>
	);
}

export default App;
