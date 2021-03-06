'use strict'

/**
 * These routes are scanned automatically by the hapi-router
 */
const LicenceHandler = require('../handlers/licence')
const LicenceNotFoundHandler = require('../handlers/licence-not-found')
const DidYouFishHandler = require('../handlers/did-you-fish')
const YearHandler = require('../handlers/year')
const SummaryHandler = require('../handlers/summary')
const ActivityHandler = require('../handlers/activities')
const DeleteActivityHandler = require('../handlers/delete-activity')
const SalmonAndLargeTroutHandler = require('../handlers/salmon-and-large-trout')
const DeleteSalmonAndLargeTroutHandler = require('../handlers/delete-salmon-and-large-trout')
const SmallCatchHandler = require('../handlers/small-catches')
const DeleteSmallCatchHandler = require('../handlers/delete-small-catch')
const ConfirmationHandler = require('../handlers/confirmation')
const ReviewHandler = require('../handlers/review')
const SaveHandler = require('../handlers/save')

// Define the validators
const licenceValidator = require('../validators/licence')
const yearValidator = require('../validators/year')
const didYouFishValidator = require('../validators/did-you-fish')
const activityValidator = require('../validators/activity')
const salmonAndLargeTroutValidator = require('../validators/salmon-and-large-trout')
const smallCatchValidator = require('../validators/small-catch')

// Define the handlers
const licenceHandler = new LicenceHandler('licence', licenceValidator)
const licenceNotFound = new LicenceNotFoundHandler('licence', licenceValidator)
const yearHandler = new YearHandler('select-year', yearValidator)
const didYouFishHandler = new DidYouFishHandler('did-you-fish', didYouFishValidator)
const summaryHandler = new SummaryHandler('summary')
const activityHandler = new ActivityHandler('activity', activityValidator)
const deleteActivityHandler = new DeleteActivityHandler('delete-activity', activityValidator)
const salmonAndLargeTroutHandler = new SalmonAndLargeTroutHandler('salmon-and-large-trout', salmonAndLargeTroutValidator)
const deleteSalmonAndLargeTroutHandler = new DeleteSalmonAndLargeTroutHandler('delete-salmon-and-large-trout')
const smallCatchHandler = new SmallCatchHandler('small-catches', smallCatchValidator)
const deleteSmallCatchHandler = new DeleteSmallCatchHandler('delete-small-catch')
const reviewHandler = new ReviewHandler('review')
const confirmationHandler = new ConfirmationHandler('confirmation')
const saveHandler = new SaveHandler('save')

module.exports = [

  // Redirect to the start page
  {
    path: '/',
    method: 'GET',
    options: { auth: false },
    handler: (request, h) => {
      return h.redirect('/licence')
    }
  },

  // Licence handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandler.handler,
    options: { auth: false }
  },

  // Licence not found handler
  {
    path: '/licence-not-found',
    method: ['GET', 'POST'],
    handler: licenceNotFound.handler,
    options: { auth: false }
  },

  // Year handler
  {
    path: '/select-year',
    method: ['GET', 'POST'],
    handler: yearHandler.handler
  },

  // Did you fish
  {
    path: '/did-you-fish',
    method: ['GET', 'POST'],
    handler: didYouFishHandler.handler
  },

  // Summary handler
  {
    path: '/summary',
    method: ['GET', 'POST'],
    handler: summaryHandler.handler
  },

  // Activity handler
  {
    path: '/activities/{id}',
    method: ['GET', 'POST'],
    handler: activityHandler.handler
  },

  // Delete activity handler
  {
    path: '/delete/activities/{id}',
    method: ['GET', 'POST'],
    handler: deleteActivityHandler.handler
  },

  // Add/edit salmon and large sea trout handler
  {
    path: '/catches/{id}',
    method: ['GET', 'POST'],
    handler: salmonAndLargeTroutHandler.handler
  },

  // Delete salmon and sea trout handler
  {
    path: '/delete/catches/{id}',
    method: ['GET', 'POST'],
    handler: deleteSalmonAndLargeTroutHandler.handler
  },

  // Add/edit the small catch handler
  {
    path: '/small-catches/{id}',
    method: ['GET', 'POST'],
    handler: smallCatchHandler.handler
  },

  // Delete the small catch handler
  {
    path: '/delete/small-catches/{id}',
    method: ['GET', 'POST'],
    handler: deleteSmallCatchHandler.handler
  },

  // Submission handler
  {
    path: '/review',
    method: ['GET', 'POST'],
    handler: reviewHandler.handler
  },

  // Confirmation handler
  {
    path: '/save',
    method: 'GET',
    handler: saveHandler.handler
  },

  // Confirmation handler
  {
    path: '/confirmation',
    method: 'GET',
    handler: confirmationHandler.handler
  },

  // Error handler
  {
    path: '/error',
    method: 'GET',
    options: { auth: false },
    handler: (request, h) => {
      return h.view('error')
    }
  },

  // Catch all
  {
    method: '*',
    path: '/{p*}',
    handler: function (request, h) {
      return h.redirect('/')
    }
  }

]
