const utils = require('../../utils')

class Module
{
	constructor(parent, params = {})
	{
		this.parent  = parent
		this.options = parent.options
		this.params  = params
		this.debug   = utils.debug(this, parent.peerId.toB58String())
	}
}

module.exports = Module
