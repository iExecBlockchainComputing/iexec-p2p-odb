'use strict'

const createLibp2p = require('./utils/createLibp2p')
const IPFS         = require('ipfs')
const OrbitDB      = require('orbit-db')
const defaultsDeep = require('defaults-deep')
const withDebug    = require('./utils/withDebug')
const CONFIG       = require('./config/config.json')

class Datastore
{
	constructor(options = {})
	{
		this.options = defaultsDeep(
			options,
			{
				ipfs:    { repo:      `/tmp/odb-5.0.0-p2p/${process.pid}/ipfs`  },
				orbitdb: { directory: `/tmp/odb-5.0.0-p2p/${process.pid}/orbitdb` },
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

		this.debug(`ipfs repo: ${this.options.ipfs.repo}`)
		const ipfs = await IPFS.create(defaultsDeep({ repo: this.options.ipfs.repo, libp2p: (opts) => createLibp2p(CONFIG.libp2p, opts) }), CONFIG.ipfs)

		this.debug(`orbitdb repo: ${this.options.orbitdb.directory}`)
		const orbitdb = await OrbitDB.createInstance(ipfs, defaultsDeep(this.options.orbitdb, CONFIG.orbitdb.core))

		this.debug(`orbitdb db name: ${this.options.dbname}`)
		this.db = await orbitdb.docs(this.options.dbname, CONFIG.orbitdb.db)

		this.debug(`${ipfs.libp2p.peerId.toB58String()} listening on addresses:`)
		this.debug(ipfs.libp2p.multiaddrs.map(addr => addr.toString()).join('\n'), '\n')
		ipfs.libp2p.connectionManager.on('peer:connect',    ({ remotePeer }) => this.debug(`[peer:connect] connected to ${remotePeer.toB58String()}`))
		ipfs.libp2p.connectionManager.on('peer:disconnect', ({ remotePeer }) => this.debug(`[peer:disconnect] disconnected from ${remotePeer.toB58String()}`))

		return this
	}
}

module.exports = Datastore
