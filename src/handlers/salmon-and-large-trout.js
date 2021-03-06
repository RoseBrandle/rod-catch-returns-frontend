'use strict'

/**
 * Salmon and large trout handler
 */
const Moment = require('moment')

const BaseHandler = require('./base')
const MethodsApi = require('../api/methods')
const SpeciesApi = require('../api/species')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const ActivitiesApi = require('../api/activities')
const testLocked = require('./common').testLocked

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const activitiesApi = new ActivitiesApi()
const methodsApi = new MethodsApi()
const speciesApi = new SpeciesApi()

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
    const cache = await request.cache().get()
    const submission = await submissionsApi.getById(cache.submissionId)
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)
    const rivers = activities.map(a => a.river)

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    if (request.params.id === 'add') {
      // Clear any existing catch id
      delete cache.largeCatch
      await request.cache().set(cache)

      // Add a new salmon and large trout
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        year: cache.year,
        types: await speciesApi.list(),
        methods: await methodsApi.list()
      })
    } else {
      // Modify an existing catch
      let largeCatch = await catchesApi.getById(`catches/${request.params.id}`)
      const largeCatchSubmission = await submissionsApi.getFromLink(largeCatch._links.submission.href)
      largeCatch = await catchesApi.doMap(largeCatch)

      // Check they are not messing about with somebody else's activity
      if (largeCatchSubmission.id !== submission.id) {
        throw new Error('Action attempted on not owned submission')
      }

      // Write the catch id onto the cache
      cache.largeCatch = { id: largeCatch.id }
      await request.cache().set(cache)

      const dateCaught = Moment(largeCatch.dateCaught)
      const payload = {
        river: largeCatch.activity.river.id,
        'date-day': dateCaught.format('DD'),
        'date-month': dateCaught.format('MM'),
        type: largeCatch.species.id,
        pounds: Math.floor(largeCatch.mass.oz / 16),
        ounces: Math.round(largeCatch.mass.oz % 16),
        system: largeCatch.mass.type,
        kilograms: largeCatch.mass.kg,
        method: largeCatch.method.id,
        released: largeCatch.released ? 'true' : 'false'
      }

      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        year: cache.year,
        types: await speciesApi.list(),
        methods: await methodsApi.list(),
        payload: payload
      })
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
    return this.writeCacheAndRedirect(request, h, errors, '/summary',
      `/catches/${encodeURIComponent(request.params.id)}`)
  }
}
