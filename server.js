'use strict'

const http = require('http')
const async = require('async')

class Mocks {
  constructor (routes, opts) {
    this.routes = this.parseRouting(routes)
    this.debug = opts.debug
  }

  parseRouting (routes) {
    if (!Array.isArray(routes)) {
      routes = [routes]
    }

    routes = routes.map((route) => {
      if (route.route && route.match) {
        throw new Error(
          'shorthand .route must be used without .match'
        )
      }

      if (route.route) {
        route.match = (data, match) => {
          match({ route: route.route })
        }
      }

      if (typeof route.reply !== 'function') {
        const msg = route.reply
        route.reply = (reply) => {
          reply(msg, 200)
        }
      }

      return route
    })

    return routes
  }

  getMock (req, res, data, cb) {
    const match = (route, cb) => {
      route.match(data, (filters) => {
        if (filters.route && filters.route !== req.url) {
          return cb(null, false)
        }

        if (filters.method && filters.method !== req.method) {
          return cb(null, false)
        }

        if (!filters.custom) {
          filters.custom = (req, res, cb) => {
            return cb(null, true)
          }
        }

        filters.custom(req, res, (err, res) => {
          if (err) return cb(err)
          if (res === false) return cb(null, false)

          if (!filters.payload) return cb(null, res)

          filters.payload(data, cb)
        })
      })
    }

    async.filter(this.routes, match, cb)
  }

  stubReply (req, res, mock) {
    mock.reply((data, code) => {
      if (code) {
        res.statusCode = code
      }

      if (typeof data === 'object') {
        data = JSON.stringify(data)
      }

      res.end(data)
    })
  }

  handle (req, res) {
    const data = []
    req.on('data', (buf) => {
      data.push(buf)
    })

    req.on('end', () => {
      const str = Buffer.concat(data).toString()

      this.debug && console.log('[DEBUG] bfx-svc-test-helper:', str)

      let parsed
      try {
        parsed = JSON.parse(str)
      } catch (e) {
        parsed = str
      }

      this.getMock(req, res, parsed, (err, matches) => {
        if (err) {
          console.error('bfx-svc-test-helper: route matching error')
          throw err
        }

        if (matches.length === 0) {
          throw new Error(`bfx-svc-test-helper: no route matched (${req.url})`)
        }

        if (matches.length > 1) {
          throw new Error(`bfx-svc-test-helper: multiple routes matched (${req.url})`)
        }

        const mock = matches[0]
        if (!mock.test) mock.test = (req, res, payload, cb) => { cb(null) }

        mock.test(req, res, parsed, (err) => {
          if (err) {
            console.error('bfx-svc-test-helper: client request test failed')
            throw err
          }

          this.stubReply(req, res, mock)
        })
      })
    })
  }
}

class Server {
  constructor (mocks, opts) {
    this.opts = opts
    this.mocks = mocks

    this.server = null
    this.port = this.opts.port
  }

  start (cb = () => {}) {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.mocks.handle.bind(this.mocks)).listen(this.port, () => {
        resolve()
        cb(null)
      })
    })
  }

  stop (cb = () => {}) {
    return new Promise((resolve, reject) => {
      this.server.close(() => {
        resolve()
        cb(null)
      })
    })
  }
}

function createServer (mocks, opts) {
  const m = typeof mocks === 'function' ? mocks() : new Mocks(mocks, opts)
  return new Server(m, opts)
}

module.exports = createServer
