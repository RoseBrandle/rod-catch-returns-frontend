/**
 * Salmon and large trout handler
 */
const BaseHandler = require('./base')

const rivers = [
  { id: 0, name: 'Derwent (Cumbria)' },
  { id: 1, name: 'Trent' }
].sort((a, b) => {
  if (a.name < b.name) {
    return -1
  }
  if (a.name > b.name) {
    return 1
  }
  return 0
})

const year = 2018

const types = [ 'Salmon', 'Sea trout' ]
const methods = [ 'Fly', 'Spinner', 'Bait' ]

module.exports = class SalmonAndLargeTroutHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for select salmon and large trout page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    if (request.params.id === 'add') {
      // Add a new salmon and large trout
      return super.readCacheAndDisplayView(request, h, { rivers, year, types, methods })
    } else {
      // Edit the salmon and large trout - replace with a database get
      const payload = {
        river: '0',
        'date-day': 6,
        'date-month': 6,
        type: 'Salmon',
        pounds: 6,
        ounces: 6,
        system: 'metric',
        kilograms: 6,
        method: 'Fly',
        released: 'true'
      }
      // Some hardcoded example data
      return h.view(this.path, { rivers, year, types, methods, payload })
    }
  }

  /**
   * Post handler for the select salmon and large trout page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return super.writeCacheAndRedirect(request, h, errors, '/summary',
      `/salmon-and-large-trout/${encodeURIComponent(request.params.id)}`)
  }
}