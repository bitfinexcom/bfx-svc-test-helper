'use strict'

const createServer = require('./server')
const request = require('request')

const server = createServer([
  {
    reply: { animal: 'platypus' },
    route: '/australia'
  },
  {
    reply: { animal: 'Fair Isle Wren' },
    route: '/england'
  }
], { port: 1337, debug: true })

;(async () => {
  await server.start()

  request({
    uri: 'http://localhost:1337/australia',
    json: true,
    body: { foo: 'bar' },
    method: 'POST'
  }, async (err, res, body) => {
    if (err) throw err

    console.log('response', body, res.statusCode)

    await server.stop()
  })
})()
