'use strict'

/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (request) => {
  const payload = request.payload
  logger.debug('Validate year: ' + JSON.stringify(payload))

  if (!payload.year) {
    return { year: 'EMPTY' }
  }
}
