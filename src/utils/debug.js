const debug = require('debug')

module.exports = (parent, id='') => debug(`iexec-p2p-odb:${parent.constructor.name}:${id}`)
