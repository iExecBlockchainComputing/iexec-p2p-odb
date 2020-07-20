const sigUtil   = require('eth-sig-util')
const { Order } = require('./types')

const TYPES =
{
	EIP712Domain: [
		{ type: "string",  name: "name"               },
		{ type: "string",  name: "version"            },
		{ type: "uint256", name: "chainId"            },
		{ type: "address", name: "verifyingContract"  },
	],
	AppOrder: [
		{ type: "address", name: "app"                },
		{ type: "uint256", name: "appprice"           },
		{ type: "uint256", name: "volume"             },
		{ type: "bytes32", name: "tag"                },
		{ type: "address", name: "datasetrestrict"    },
		{ type: "address", name: "workerpoolrestrict" },
		{ type: "address", name: "requesterrestrict"  },
		{ type: "bytes32", name: "salt"               },
	],
	DatasetOrder: [
		{ type: "address", name: "dataset"            },
		{ type: "uint256", name: "datasetprice"       },
		{ type: "uint256", name: "volume"             },
		{ type: "bytes32", name: "tag"                },
		{ type: "address", name: "apprestrict"        },
		{ type: "address", name: "workerpoolrestrict" },
		{ type: "address", name: "requesterrestrict"  },
		{ type: "bytes32", name: "salt"               },
	],
	WorkerpoolOrder: [
		{ type: "address", name:"workerpool"          },
		{ type: "uint256", name:"workerpoolprice"     },
		{ type: "uint256", name:"volume"              },
		{ type: "bytes32", name:"tag"                 },
		{ type: "uint256", name:"category"            },
		{ type: "uint256", name:"trust"               },
		{ type: "address", name:"apprestrict"         },
		{ type: "address", name:"datasetrestrict"     },
		{ type: "address", name:"requesterrestrict"   },
		{ type: "bytes32", name:"salt"                },
	],
	RequestOrder: [
		{ type: "address", name: "app"                },
		{ type: "uint256", name: "appmaxprice"        },
		{ type: "address", name: "dataset"            },
		{ type: "uint256", name: "datasetmaxprice"    },
		{ type: "address", name: "workerpool"         },
		{ type: "uint256", name: "workerpoolmaxprice" },
		{ type: "address", name: "requester"          },
		{ type: "uint256", name: "volume"             },
		{ type: "bytes32", name: "tag"                },
		{ type: "uint256", name: "category"           },
		{ type: "uint256", name: "trust"              },
		{ type: "address", name: "beneficiary"        },
		{ type: "address", name: "callback"           },
		{ type: "string",  name: "params"             },
		{ type: "bytes32", name: "salt"               },
	],
	AppOrderOperation: [
		{ type: "AppOrder",        name: "order"     },
		{ type: "uint256",         name: "operation" },
	],
	DatasetOrderOperation: [
		{ type: "DatasetOrder",    name: "order"     },
		{ type: "uint256",         name: "operation" },
	],
	WorkerpoolOrderOperation: [
		{ type: "WorkerpoolOrder", name: "order"     },
		{ type: "uint256",         name: "operation" },
	],
	RequestOrderOperation: [
		{ type: "RequestOrder",    name: "order"     },
		{ type: "uint256",         name: "operation" },
	],
}

const TYPENAMES = {
	[Order.Type.APP_ORDER]:        'AppOrder',
	[Order.Type.DATASET_ORDER]:    'DatasetOrder',
	[Order.Type.WORKERPOOL_ORDER]: 'WorkerpoolOrder',
	[Order.Type.REQUEST_ORDER]:    'RequestOrder',
}

const type = (order) =>
{
	const keys = Object.keys(order)
	if (       TYPES.AppOrder.every(({ name }) => keys.indexOf(name) !== -1)) return Order.Type.APP_ORDER
	if (   TYPES.DatasetOrder.every(({ name }) => keys.indexOf(name) !== -1)) return Order.Type.DATASET_ORDER
	if (TYPES.WorkerpoolOrder.every(({ name }) => keys.indexOf(name) !== -1)) return Order.Type.WORKERPOOL_ORDER
	if (   TYPES.RequestOrder.every(({ name }) => keys.indexOf(name) !== -1)) return Order.Type.REQUEST_ORDER
	throw Error('unkown struct')
}

const hash = (type, domain, message) =>
{
	return sigUtil.TypedDataUtils.sign({
		types: TYPES,
		primaryType: TYPENAMES[type],
		message,
		domain,
	})
}



module.exports.type = type
module.exports.hash = hash
