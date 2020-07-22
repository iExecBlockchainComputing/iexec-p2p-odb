const protons = require('protons')

module.exports = protons(`
	message Request {
		enum Type {
			NEW    = 0;
			UPDATE = 1;
			SEARCH = 2;
		}
		required Type   type   = 1;
		optional bytes  key    = 2;
		optional bytes  value  = 3;
	}
`)
