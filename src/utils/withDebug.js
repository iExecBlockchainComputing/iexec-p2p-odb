const debug = require('debug')
module.exports = (object) => debug(`iexec-p2p-odb:${object.constructor.name}`)
