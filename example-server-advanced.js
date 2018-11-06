'use strict'

const createServer = require('./server')
const request = require('request')
const assert = require('assert')

const server = createServer({
  reply: (reply) => {
    reply({ fruit: 'lemon' }, 404) // default: 200
  },

  // all are optional
  match: (payload, match) => {
    match({
      route: '/foo',
      method: 'POST',
      payload: (payload, cb) => {
        return cb(null, payload.fruit === 'mango')
      },
      custom: (req, res, cb) => {
        return cb(null, true)
      }
    })
  },

  // makes assertions on the _sent request_
  test: (req, res, payload, cb) => {
    assert.ok(payload.fruit, 'missing property')
    cb(null)
  }
}, { port: 1337 })

;(async () => {
  await server.start()

  request({
    uri: 'http://localhost:1337/foo',
    json: true,
    body: { fruit: 'mango' },
    method: 'POST'
  }, async (err, res, body) => {
    if (err) throw err

    console.log('response', body, res.statusCode)

    await server.stop()
  })
})()
