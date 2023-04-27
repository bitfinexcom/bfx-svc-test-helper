'use strict'

const createServer = require('./server')
const fetch = require('node-fetch')

const server = createServer([
  {
    reply: { animal: 'platypus' },
    route: '/australia'
  },
  {
    reply: { animal: 'Fair Isle Wren' },
    route: '/england'
  }
], { port: 1337, debug: true });

(async () => {
  await server.start()

  const res = await fetch('http://localhost:1337/australia', {
    body: JSON.stringify({ foo: 'bar' }),
    method: 'POST'
  })

  console.log('response', await res.json(), res.status)

  await server.stop()
})()
