const uuid = require('uuid/v4')

const BaseHandler = require('./base')
const logger = require('node-js-logger')

module.exports = class LicenceHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  async doGet (request, h) {
    logger.info('Get handler')
    return h.view(this.path)
  }

  async doPost (request, h, errors) {
    logger.info('Post handler')

    if (!errors) {
      request.cookieAuth.set({ sid: uuid() })
    }

    return h.redirect('/licence')
  }
}