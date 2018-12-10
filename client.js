'use strict'

const { PeerRPCClient } = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

class Client {
  constructor (worker) {
    this.peer = null
    this.link = null

    this.worker = worker
    this.workerName = this.getWorkerName(worker)
  }

  getWorkerName (worker) {
    if (typeof worker === 'string') {
      return worker
    }

    return worker.name
  }

  connectGrape (cb = () => {}) {
    return new Promise((resolve, reject) => {
      if (this.link && this.peer) {
        cb(null)
        resolve()
        return
      }

      this.link = new Link({
        grape: 'http://127.0.0.1:30001'
      })
      this.link.start()

      this.peer = new PeerRPCClient(this.link, {})
      this.peer.init()

      resolve()
      cb(null)
    })
  }

  request (query, opts, cb = () => {}) {
    return new Promise((resolve, reject) => {
      if (typeof opts === 'function') {
        this.request(query, { timeout: 10000 }, opts)
        return
      }

      this.connectGrape(() => {
        this.peer.request(this.workerName, query, opts, (err, res) => {
          if (err) {
            reject(err)
            cb(err)
            return
          }

          resolve(res)
          cb(null, res)
        })
      })
    })
  }

  stop (cb = () => {}) {
    return new Promise((resolve, reject) => {
      if(this.peer && this.link){
        this.peer.stop()
        this.link.stop()
      }
      resolve()
      cb(null)
    })
  }
}

function createClient (worker) {
  return new Client(worker)
}

module.exports = createClient
