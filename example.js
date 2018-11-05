'use strict'

const path = require('path')

const createGrapes = require('./grapes')
const createWorker = require('./worker')
const createClient = require('./client')

const grapes = createGrapes()

;(async () => {
  await grapes.start()

  const worker = createWorker({
    env: 'development',
    wtype: 'wrk-util-net-api',
    apiPort: 8721,
    serviceRoot: path.join(__dirname, '..', 'bfx-util-net-js')
  }, grapes)

  await worker.start()
  console.log('worker started, announcing on grape')

  // you can also pass 'rest:util:net'
  const client = createClient(worker)

  const res = await client.request({
    action: 'getIpGeo',
    args: [ '8.8.8.8' ]
  })

  console.log('got response:')
  console.log(res)

  await client.stop()
  console.log('client stopped')

  await worker.stop()
  console.log('worker stopped')
  await grapes.stop()
})()
