'use strict'

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')
const EventEmitter = require('events')

class Grapes extends EventEmitter {
  constructor (opts) {
    super()
    this.grapes = this.addDefaultGrapes()
  }

  start (cb = () => {}) {
    return new Promise((resolve, reject) => {
      const tasks = this.grapes.map((grape, i) => {
        return (cb) => {
          if (i === 0) grape.once('ready', cb)
          else grape.once('node', cb)

          grape.start()
        }
      })

      waterfall(tasks, (err) => {
        if (err) {
          this.emit('error')
          reject(err)
          return cb(err)
        }
        this.emit('ready')
        resolve()
        cb(null)
      })
    })
  }

  onAnnounce (serviceName, cb = () => {}) {
    return new Promise((resolve, reject) => {
      if (typeof serviceName === 'function') {
        this.onAnnounce(null, serviceName)
        return
      }

      if (!this.grapes[0]) {
        this.on('ready', () => {
          this.onAnnounce(serviceName, cb)
        })

        return
      }

      this.grapes[0].once('announce', (name) => {
        if (!serviceName) {
          resolve()
          cb(null)
          return
        }

        if (serviceName === name) {
          resolve()
          return cb(null)
        }
      })
    })
  }

  addDefaultGrapes () {
    const g1 = new Grape({
      dht_port: 20002,
      dht_bootstrap: [ '127.0.0.1:20001' ],
      api_port: 40001
    })
    const g2 = new Grape({
      dht_port: 20001,
      dht_bootstrap: [ '127.0.0.1:20002' ],
      api_port: 30001
    })
    return [ g1, g2 ]
  }

  stop (cb = () => {}) {
    return new Promise((resolve, reject) => {
      const tasks = this.grapes.map((grape) => {
        return (cb) => {
          grape.stop(cb)
        }
      })

      waterfall(tasks, (err) => {
        if (err) {
          reject(err)
          return cb(err)
        }

        resolve()
        cb(null)
      })
    })
  }
}

function createGrapes (opts) {
  return new Grapes(opts)
}

module.exports = createGrapes
