'use strict'

const IPFS         = require('ipfs')
const OrbitDB      = require('orbit-db')
const defaultsDeep = require('@nodeutils/defaults-deep')
const withDebug    = require('./utils/withDebug')
const CONFIG       = require('./config/config.json')

class Datastore
{
	constructor(options = {})
	{
		this.options = defaultsDeep(
			options,
			{
				dbname:     `odb/5.0.0/p2p`,
				ipfsDir:    `/tmp/odb-5.0.0-p2p/${process.pid}/ipfs`,
				orbitdbDir: `/tmp/odb-5.0.0-p2p/${process.pid}/orbitdb`,
			}
		)
		this.debug = withDebug(this)
	}

	static async create(options = {})
	{
		return await (new Datastore(options)).start()
	}

	async start()
	{
		this.debug(`start`)
		const ipfs    = await IPFS.create(defaultsDeep({ repo: this.options.ipfsDir }, CONFIG.ipfs))
		const orbitdb = await OrbitDB.createInstance(ipfs, { directory: this.options.orbitdbDir })
		this.db       = await orbitdb.docs(this.options.dbname, CONFIG.orbitdb.db)

		this.debug(`${ipfs.libp2p.peerId.toB58String()} listening on addresses:`)
		this.debug(ipfs.libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')
		ipfs.libp2p.connectionManager.on('peer:connect',    ({ remotePeer }) => this.debug(`[peer:connect] connected to ${remotePeer.toB58String()}`))
		ipfs.libp2p.connectionManager.on('peer:disconnect', ({ remotePeer }) => this.debug(`[peer:disconnect] disconnected from ${remotePeer.toB58String()}`))

		return this
	}
}

module.exports = Datastore