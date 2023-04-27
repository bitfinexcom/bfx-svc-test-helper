'use strict'

const createServer = require('./server')
const fetch = require('node-fetch')
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
}, { port: 1337 });

(async () => {
  await server.start()

  const res = await fetch('http://localhost:1337/foo', {
    body: JSON.stringify({ fruit: 'mango' }),
    method: 'POST'
  })

  console.log('response', await res.json(), res.status)

  await server.stop()
})()
