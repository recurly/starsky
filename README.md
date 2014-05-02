
# Starsky

Starsky is a high-level, opinionated node module for writing services that consume messages from [RabbitMQ](https://www.rabbitmq.com/). It's modeled directly after the elegant approach taken by the Ruby library, [Hutch](https://github.com/gocardless/hutch). The opinions baked into the module are the same as Hutch's:

  - topic exchanges
  - durable queues & exchanges
  - persistant messages
  - publisher confirms

## Install

With npm:

```sh
$ npm install starsky
```

## Usage

### Connections

To connect, invoke `starsky.connect()`. The callback will be invoked once the connection to RabbitMQ has been established and the underlying exchange as been created and/or opened.

```js
var starsky = require('starsky');

starsky.connect(callback);
```

To disconnect, invoke `starsky.disconnect(callback)`. The callback will be called once any in-flight messages have been processed and/or published.

```js
var starsky = require('starsky');

starsky.disconnect(callback);
```

### Configuring

To configure programatically, invoke `starsky.set()` with the configuration option name and value:

```js
var starsky = require('starsky');

starsky.set('mq host', 'localhost');
starsky.set('mq port', 5672);
starsky.set('exchange', 'demo');
```

If configuration objects are more your style, just pass them all in at once.

```js
var starsky = require('starsky');

starsky.set({
  'mq host': 'localhost',
  'mq port': 5672,
  'exchange': 'demo'
});
```

The configuration options:

  - `mq exchange` -- The topic exchange name to be created. Defaults to `starsky`
  - `mq host` -- The rabbitmq host. Defaults to `localhost`
  - `mq port` -- The rabbitmq port. Defaults to `5672`
  - `mq vhost` -- The rabbitmq vhost. Defaults to `/`
  - `mq username` -- The rabbitmq username. Defaults to `guest`
  - `mq password` -- The rabbitmq password. Defaults to `guest`
  - `mq tls` -- Whether rabbitmq requires a secure connection. Defaults to `false`.
  - `mq tls cert` -- The rabbitmq tls cert file path, if `tls` is set to true.
  - `mq tls key` -- The rabbitmq tls key file path, if `tls` is set to true.
  - `namespace` -- A prefix to prepend to queue names. Defaults to `undefined`

### Publishing

To publish a message, invoke `starsky.publish(topic, callback)` with a topic name, message and callback. The callback will be used for the message confirmation. If the underlying connection has not been established when publishing a message, an error will bubble up to the callback.

```js
var starsky = require('starsky');

starsky.set('mq host', 'localhost');
starsky.set('mq port', 5672);
starsky.set('exchange', 'demo');

setInterval(function () {
  starsky.publish('log.info', {
    hello: 'world'
  }, confirm);
}, 1000);

function confirm (err) {
  if (err) console.error(err.message);
}

starsky.connect();
```

### Consuming

To create a consumer, invoke `starsky.consumer(name)`. The name should be whatever you want the name of the queue to be inside RabbitMQ. Note that if you have a prefix option set, that will be prefixed to the name when the queue is created.

```js
var starsky = require('starsky');

var consumer = starsky.consumer('log');

starsky.set('mq host', 'localhost');
starsky.set('mq port', 5672);
starsky.set('exchange', 'demo');

starsky.once('connect', function () {
  consumer.subscribe('log.info');
  consumer.process(function (msg, done) {
    console.log('id: %s', msg.id);
    console.log('body: %j', msg.body);
    console.log('timestamp: %s', msg.timestamp);
    console.log('topic: %s', msg.topic);
    done();
  });
});

starsky.connect();
```

To subscribe to a topic, invoke `consumer.subscribe(topic)`. This will setup the necessary queue bindings with RabbitMQ. You must setup all your subscriptions prior to processing messages.

```js
consumer.subscribe('log.info');
consumer.subscribe('log.#');
consumer.subscribe('log.*');
```

To start processing message, invoke `consumer.process(fn)`. This will invoke the function for each message routed to the queue. There are two arguments passed to the function: `msg` and `done`. The `msg` is an object with the following properties:

  - `id`: A unique identifer for the message.
  - `body`: The actual message published.
  - `timestamp`: The time when the message was published.
  - `topic`: The topic the message was published with.

```js
consumer.process(function (msg, done) {
  console.log('id: %s', msg.id);
  console.log('body: %j', msg.body);
  console.log('timestamp: %s', msg.timestamp);
  console.log('topic: %s', msg.topic);
  done();
});
```

The `done` function is a callback that should be invoked when all the work that needs to be accomplished it finished. If an error occurs that requires the message to be re-tried, pass the error as the first argument. This will direct the message to be rejected.

To control the amount of messages the consumer can accept, invoke `consumer.prefetch(amount)` method. By default it only accept `1` message at a time. If you want to turn on the "firehouse", meaning accept all the messages as they are published, use `0`.

```js
consumer.prefetch(10);
```

## Development

Installing

```sh
$ make
```

Running tests

```sh
$ make test
```

Code Coverage *(requires jscoverage)*

```sh
$ make lib-cov
```

## License

MIT
