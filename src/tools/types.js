const protons = require('protons')

const { Request, Order, Stats } = protons(`
	message Request {
		enum Type {
			ORDER = 0;
			STATS = 1;
		}
		required Type  type  = 1;
		optional Order order = 2;
		optional Stats stats = 3;
	}

	message Order {
		enum Type {
			APP_ORDER        = 0;
			DATASET_ORDER    = 1;
			WORKERPOOL_ORDER = 2;
			REQUEST_ORDER    = 3;
		}
		required bytes id   = 1;
		required Type  type = 2;
	}

	message Stats {
		enum NodeType {
			GO      = 0;
			NODEJS  = 1;
			BROWSER = 2;
		}
		repeated bytes    connectedPeers = 1;
		optional NodeType nodeType       = 2;
	}
`)

module.exports.Request = Request
module.exports.Order   = Order
module.exports.Stats   = Stats
