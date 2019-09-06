'use strict'

const http = require('http')
const Link = require('grenache-nodejs-link')
const { getGrapeApiPort } = require('./utils')

const getRawBody = require('raw-body')
const async = require('async')

class FauxGrenache {
  constructor (stubs, grapes, opts = {}) {
    this.stubs = stubs
    this.grapes = grapes

    this.port = opts.port || 1557
    this.link = opts.link || null
  }

  getLink () {
    if (this.link) {
      return this.link
    }

    const p = getGrapeApiPort(this.grapes)
    this.link = new Link({
      grape: 'http://127.0.0.1:' + p
    })

    return this.link
  }

  start (cb = () => {}) {
    return new Promise((resolve, reject) => {
      this.link = this.getLink()

      async.waterfall([
        (next) => {
          this.link.start()
          next()
        },

        (next) => {
          this.listen(this.port, next)
        },

        (next) => {
          this.announce(this.stubs, next)
        }
      ], (err) => {
        if (err) {
          reject(err)
          cb(err)
          return
        }

        resolve()
        cb(null)
      })
    })
  }

  stop (cb = () => {}) {
    return new Promise((resolve, reject) => {
      async.waterfall([
        (next) => {
          this.stopAnnounces(this.stubs)
          next()
        },

        (next) => {
          this.link.stop()
          next()
        },

        (next) => {
          this.server.close(next)
        }
      ], (err) => {
        if (err) {
          reject(err)
          cb(err)
          return
        }

        resolve()
        cb(null)
      })
    })
  }

  listen (port, cb) {
    const stubs = this.stubs

    // its just tests, so lets use some async/await
    this.server = http.createServer(async (req, res) => {
      const buf = await getRawBody(req)
      const parsed = JSON.parse(buf.toString())

      const [id, service, data] = parsed
      if (!stubs[service]) {
        throw new Error('ERR_TEST_MISSING_STUB')
      }

      if (!stubs[service][data.action]) {
        throw new Error('ERR_TEST_MISSING_STUB_ACTION')
      }

      function reply (err, data) {
        if (err) {
          res.end(
            `["${id}","ERR_API_BASE: ${err.message}",null]`
          )
          return
        }

        const d = JSON.stringify([id, null, data])
        res.end(d)
      }

      data.args.push(reply)
      const args = [{}, ...data.args]

      stubs[service][data.action].apply(stubs[service], args)
    }).listen(port, cb)
  }

  stopAnnounces (stubs) {
    Object.keys(stubs).map((el) => {
      this.link.stopAnnouncing(el, this.port)
    })
  }

  announce (stubs, cb) {
    const tasks = Object.keys(stubs).map((el) => {
      return (cb) => {
        this.link.startAnnouncing(el, this.port, cb)
      }
    })

    async.parallel(tasks, cb)
  }
}

function fauxGrenache (stubs, grapes, opts) {
  return new FauxGrenache(stubs, grapes, opts)
}

module.exports = fauxGrenache
