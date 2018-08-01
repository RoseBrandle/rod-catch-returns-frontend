// Initialize the environment
require('dotenv').config()

const Glue = require('glue')
const Nunjucks = require('nunjucks')

const logger = require('node-js-logger')
const GoodWinston = require('good-winston')
const goodWinstonStream = new GoodWinston({ winston: logger })

logger.init({
  level: 'info',
  airbrakeKey: process.env.errbit_key,
  airbrakeHost: process.env.errbit_server,
  airbrakeLevel: 'error'
})

const manifest = {

  // Configure Hapi server and server-caching subsystem
  server: {
    port: process.env.PORT || 3000,
    cache: [
      {
        engine: require('catbox-redis'),
        host: process.env.REDIS_HOSTNAME,
        port: process.env.REDIS_PORT,
        partition: 'session-cache'
      }
    ]
  },

  // Register plugins
  register: {
    plugins: [
      /*
       * Plugin for logging
       * See https://www.npmjs.com/package/good
       */
      {
        plugin: require('good'),
        options: {
          reporters: {
            winston: [goodWinstonStream]
          }
        }
      },

      /*
       * Templates rendering plugin support for hapi.js
       * See https://www.npmjs.com/package/vision
       */
      {
        plugin: require('inert')
      },

      /*
       * Static file and directory handlers plugin for hapi.js
       * See https://www.npmjs.com/package/inert
       */
      {
        plugin: require('vision')
      },

      /*
       * Plug in for cookie based authentication
       * See https://www.npmjs.com/package/hapi-auth-cookie
       */
      {
        plugin: require('hapi-auth-cookie')
      },

      /*
       * Add a rudimentary health check
       * hit /health and check status 200
       * See: https://www.npmjs.com/package/hapi-alive
       */
      {
        plugin: require('hapi-alive'),
        options: {
          responses: {
            healthy: {
              message: 'Healthy'
            },
            unhealthy: {
              statusCode: 400
            }
          }
        }
      },

      /*
       * Plugin for serving up robots.txt
       * See https://www.npmjs.com/package/hapi-robots and
       * https://en.wikipedia.org/wiki/Robots_exclusion_standard
       */
      {
        plugin: require('hapi-robots'),
        options: {
          // will disallow everyone from every path:
          '*': ['/']
        }
      },

      /*
       * Add plugin for CSRF protection
       * See https://www.npmjs.com/package/crumb
       */
      {
        plugin: require('crumb')
      }
    ]
  }
}

const options = {
  relativeTo: __dirname
}

;(async () => {
  try {
    const server = await Glue.compose(manifest, options)

    // Set up the nunjunks templating engine
    server.views({
      engines: {
        html: {
          compile: function (src, options) {
            const template = Nunjucks.compile(src, options.environment)
            return function (context) {
              return template.render(context)
            }
          },
          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false })
            return next()
          }
        }
      },
      relativeTo: __dirname,
      path: 'src/views',
      context: require('./src/common-view-data').context
    })

    // Set up the route handlers for static resources
    server.route({
      method: 'GET',
      path: '/public/{param*}',
      config: {
        auth: false
      },
      handler: {
        directory: {
          path: 'public'
        }
      }
    })

    // Set up default authentication strategy using cookies
    server.auth.strategy('session', 'cookie', {
      password: process.env.COOKIE_PW,
      cookie: 'sid',
      redirectTo: '/licence',
      isSecure: false
    })

    server.auth.default('session')

    /*
     * Plugin to automatically load the routes based on their file location
     * See https://www.npmjs.com/package/hapi-router. Run last so the default authentication
     * strategy can be registered first
     */
    await server.register({
      plugin: require('hapi-router'),
      options: {
        routes: './src/routes/**/*.js' // uses glob to include files
      }
    })

    await server.start()
    logger.info(`Server started at ${server.info.uri}`)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
})()