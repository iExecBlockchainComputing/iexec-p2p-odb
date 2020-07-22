const Core       = require('./src/Core')
const { ethers } = require('ethers')

const Interactions = require('./src/modules/Interactions')
const Listener     = require('./src/modules/Listener')
const MemoryDB     = require('./src/modules/MemoryDB')
const MongoDB      = require('./src/modules/MongoDB')

async function main()
{
	const instance = await Core.create({
		modules: {
			interactions: { type: Interactions                                                       },
			listener:     { type: Listener,                               chains: [ 1, 3, 4, 5, 42 ] },
			database:     { type: process.env.MONGO ? MongoDB : MemoryDB, url:    'localhost:27017'  },
		}
	})

	process.stdin.on('data', async (message) => {
		try
		{
			instance.modules.interactions.pushOrder({
				name:              'iExecODB',
				version:           '5.0.0',
				chainId:           1,
				verifyingContract: '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f',
			},{
				dataset:            ethers.constants.AddressZero,
				datasetprice:       0,
				volume:             1,
				tag:                ethers.constants.HashZero,
				apprestrict:        ethers.constants.AddressZero,
				workerpoolrestrict: ethers.constants.AddressZero,
				requesterrestrict:  ethers.constants.AddressZero,
				salt:               ethers.utils.hexlify(ethers.utils.randomBytes(32)),
			})
		}
		catch (err)
		{
			console.error(err)
		}
	})
}

main()
