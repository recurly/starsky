
# Starsky

Starsky is a high-level, opininated node module for writing services that consume messages from RabbitMQ. It's modeled directly after the elegant approach taken by the Ruby library, [Hutch](https://github.com/gocardless/hutch). The opinions baked into the module are the same as Hutches:

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

### Connecting

To connect, invoke `starsky.connect()`. The callback will be invoked once the connection to RabbitMQ has been established and the underlying exchange as been created and/or opened.

```js
var starsky = require('starsky');

starsky.connect(callback);
```

### Configuring

To configure programatically, invoke `starsky.set()` with the the option name and value:

```js
var starsky = require('starsky');

starsky.set('mq vhost', '/demo');
starsky.set('mq tls', true);

starsky.connect(callback);
```

There are several configuration options:

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

To publish a message, invoke `startsky.publish()` with the topic name, the message and the callback which should be used for the message confirmation.

```js
var starsky = require('starsky');

starsky.connect(function () {
  starsky.publish('starsky.test', {
    subject: 'test message'
  }, confirm);
});

function confirm (err) {
  if (err) throw err
}
```

### Consuming

Consumers are defined by a simple node module that exports a few key things:

  - `name` -- The name of the queue to create and recieve message from.
  - `topic` -- The topic to use as a subscription binding.
  - `consume` -- The function to mass each message to.

For example:

```js
exports.name = 'test-consumer';
exports.topic = 'starsky.test';
exports.consume = function (msg, next) {
  console.log('%j', msg);
  setTimeout(next, 1000);
};
```

In order to run the consumer, leverage the cli tool that comes with this library:

```
$ starsky [options] <cosumer_module>
```

The options are the same as the configuration mentioned [above](#configuring):

```sh
$ ./bin/starsky --help

  Usage: starsky [options] consumer-module.js

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    --config [config]            filepath to the yaml or json configuration
    --namespace [namespace]      namespace to prepend to consumer queue names
    --mq_exchange [mq_exchange]  exchange name
    --mq_host [mq_host]          rabbit server host
    --mq_port [mq_port]          rabbit server port
    --mq_vhost [mq_vhost]        rabbit server vhost
    --mq_username [mq_username]  rabbit server username
    --mq_password [mq_password]  rabbit server password
    --mq_tls [mq_tls]            use tls for the rabbit server connection
    --mq_tls_cert [mq_tls_cert]  filepath to the tls cert
    --mq_tls_key [mq_tls_key]    filepath to the tls key
```

The one option that will standout there is the `config` option. This can be a yaml configuration file that follows the same format as Hutch. This allows you to share the same configuration file in an environment where you may have both Starsky & Hutch consumers.

## Examples

To run the examples, we need to start the consumer. We will do this by pointing the starsky bin script to our example consumer.

```sh
$ starsky --config ./examples/config.yml ./examples/consumer.js
```

Then we just need to start the producer and watch the messages flow.

```sh
$ node ./examples/producer.js
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
