# bfx-svc-test-helper

Test helper to help with common day to day testing tasks.

## Do you see yourself copy/pasting or doing the same setup code again?

Maybe it's time for a pull request or an issue! `bfx-svc-test-helper` is open
for improvements and suggestions that make our day to day life as a team easier!

## Usage in tests

The API supports Promise and callback based APIs. For a common example,
see [example.js](example.js).


## API

### `createGrapes() => Grapes`

Creates an instance to manage Grapes for testing.

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

### utils.getApi(worker) => Api

Returns the loc.api instance of the worker
