'use strict'

const IexecODBP2P = require('./src/iexecodbp2p')

async function main()
{
	const instance = await IexecODBP2P.create({ listen: process.env.LISTEN })

	process.stdin.on('data', () => {
		console.log('query:', instance.datastore.db.query((entry) => true))
	})
}


main()
