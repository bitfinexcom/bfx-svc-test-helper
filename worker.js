'use strict'

const worker = require('bfx-svc-boot-js/lib/worker')

class Worker {
  constructor (conf, grapes) {
    this.worker = null
    this.grenacheConf = null

    this.conf = conf
    this.grapes = grapes
    this.name = null
  }

  start (cb = () => {}) {
    return new Promise((resolve, reject) => {
      this.worker = worker(this.conf)

      if (!this.grapes) {
        resolve()
        cb(null)
        return
      }

      if (!this.worker.getGrcConf) {
        resolve()
        return cb(null)
      }

      this.grenacheConf = this.worker.getGrcConf()

      if (!this.grenacheConf.services) {
        resolve()
        return cb(null)
      }

      const [service] = this.grenacheConf.services
      this.name = service
      this.grapes.onAnnounce(service, () => {
        resolve()
        cb(null)
      })
    })
  }

  stop (cb = () => {}) {
    return new Promise((resolve, reject) => {
      this.worker.stop((err) => {
        if (err) {
          reject(err)
          cb(err)
          return
        }

        cb(null)
        resolve()
      })
    })
  }
}

function createWorker (opts, grapes) {
  return new Worker(opts, grapes)
}

module.exports = createWorker
