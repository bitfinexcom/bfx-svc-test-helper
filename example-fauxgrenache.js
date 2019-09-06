'use strict'

const createGrapes = require('./grapes')
const createClient = require('./client')
const createFxGrenache = require('./fauxgrenache')

const grapes = createGrapes()

const stubs = {
  'rest:util:net': {
    getIpInfo (space, ip, cb) {
      const res = [ip, { country: 'US', region: 'CA' }]
      return cb(null, res)
    }
  }
}

;(async () => {
  await grapes.start()

  // lets create a worker stub
  const fxg = createFxGrenache(stubs, grapes)
  await fxg.start()
  console.log('stub service started, announcing on grape')

  const client = createClient('rest:util:net')
  const res = await client.request({
    action: 'getIpInfo',
    args: ['8.8.8.8']
  })

  console.log('got response:', res)

  await client.stop()
  console.log('client stopped')
  await fxg.stop()
  console.log('grenache stub stopped')
  await grapes.stop()
  console.log('grapes stopped')
})()
