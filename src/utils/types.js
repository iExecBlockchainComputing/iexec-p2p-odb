const protons = require('protons')

module.exports = protons(`
	message Request {
		enum Type {
			ORDER  = 0;
			NOTICE = 1;
			STATS  = 2;
		}
		required Type   type   = 1;
		optional Order  order  = 2;
		optional Notice notice = 3;
		optional Stats  stats  = 4;
	}

	message Order {
		enum Type {
			DOMAIN          = -1;
			APPORDER        = 0;
			DATASETORDER    = 1;
			WORKERPOOLORDER = 2;
			REQUESTORDER    = 3;
		}
		required Type  type   = 1;
		required bytes domain = 2;
		required bytes order  = 3;
	}

	message Notice {
		required bytes id = 1;
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
