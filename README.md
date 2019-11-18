# bfx-svc-test-helper

Test helper to help with common day to day testing tasks.

## Do you see yourself copy/pasting or doing the same setup code again?

Maybe it's time for a pull request or an issue! `bfx-svc-test-helper` is open
for improvements and suggestions that make our day to day life as a team easier!

## Usage in tests

The API supports Promise and callback based APIs. For a common example,
see [example.js](example.js).

You can also stub/mock Grenache services. See
[example-fauxgrenache.js](example-fauxgrenache.js) for an example.

## API

### `createGrapes([opts]) => Grapes`

Creates an instance to manage Grapes for testing.

### Arguments

- `opts` is an object of additional options, there is able to pass:
  - `ports` is an array of object, for example:

  ```js
  [{
    dht_port: 20002,
    dht_bootstrap: ['127.0.0.1:20001'],
    api_port: 40001
  }, {
    dht_port: 20001,
    dht_bootstrap: ['127.0.0.1:20002'],
    api_port: 30001
  }]
  ```

### `grapes.start([cb]) => Promise`

Creates two "default Grapes" and calls the callback when the found each other.

### `grapes.onAnnounce([servicename], [cb]) => Promise`

Calls the callback as soon as the service is announced on the network.
Leave blank to match any announce.

### `grapes.stop([cb]) => Promise`

Stops the Grapes.

### `createWorker(worker, [grapes]) => Worker`

Creates an svc-js worker instance.

### `worker.start([cb]) => Promise`

Starts the worker. If `grapes` were passed via `createWorker`, resolves as
soon as the service name is announced on the network.

### `worker.stop([cb]) => Promise`

Stops the worker.

### `createClient(worker) => Client`

Sets up a typical PeerClient needed for most use cases.
`worker` can be the name of the worker e.g. `rest:util:net`, or can be a
`<Worker>` instance from `createWorker`

### `client.request(args, [opts], [cb]) => Promise`

Makes a request to the configured worker.

### `client.stop([cb]) => Promise`

Stops the client.

### `createFxGrenache(mocks, grapes|url, [opts]) => FauxGrenacheServer`

Spins up Grenache service mocks.

  `opts.port` - the port the server will listen to, defaults to `1557`
  `opts.link` - custom / own link, can be used for customised setups

Second parameter is either a `Grapes` instance or a http url pointing
to the Grenache Grape HTTP Server.

### `fxgrenache.start([cb]) => Promise`

Makes a request to the configured mockserver.

### `fxgrenache.stop([cb]) => Promise`

Stops the server.

### `createServer(mocks, opts) => Server`

Sets up a HTTP stub/mock server.

  `opts.port` - the port the server will listen to.
  `opts.debug` - print the data sent from the client via post

`opts.debug` is useful when you are creating new mock definitions, especially
if you use an external client library to send the request.

`mocks` can be a mock definition or an array of mock definitions.

The server can basically match, test and return anything on request/response,
sent payloads etc. For convenience, there are shorthands that should suffice
in most cases: [example-server-simple.js](example-server-simple.js).

For advanced route matching and testing of incoming requests, see [example-server-advanced.js](example-server-advanced.js)

### `server.start([cb]) => Promise`

Makes a request to the configured mockserver.

### `server.stop([cb]) => Promise`

Stops the server.

### `utils.getApi(worker) => Api`

Returns the loc.api instance of the worker

### `utils.getGrapeApiPort(grapesWorker) => port`

Gets the HTTP port of one of the Grape workers

Example:

```js
const createGrapes = require('bfx-svc-test-helper/grapes')
const utils = require('bfx-svc-test-helper/utils')

const grapes = createGrapes()

;(async () => {
  await grapes.start()
  const port = utils.getGrapeApiPort(grapes)
  console.log(port) // 30001
})()
```
