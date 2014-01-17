
# Starsky

Starsky is a high-level, opininated node module for writing services that consume messages from RabbitMQ. It's modeled directly after the elegant approach taken by the Ruby library, [Hutch](https://github.com/gocardless/hutch). The opinions baked into the module are the same as Hutches:

  - topic exchanges
  - durable queues & exchanges
  - persistant messages
  - publisher confirms

## Connecting

To connect, invoke `starsky.connect`:

```js
var starsky = require('starsky');

starsky.connect();
```

To configure, invoke `starsky.set` the the option name and value:

```js
var starsky = require('starsky');

starsky.set('mq vhost', '/demo');
starsky.set('mq tls', true);

starsky.connect();
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

## Publishing

To publish a message, invoke 'startsky.publish' with the topic name, the message and the callback which should be used for the message confirmation.

```js
var starsky = require('starsky');

starsky.publish('starsky.test', {
  subject: 'test message'
});

starsky.connect();
```

## Consuming

Consumers are defined by a simple node module that exports a few key things:

  - the `queue` to create and recieve message from
  - the `topic` to use as a subscription binding
  - the `consume` function to process the actual messages

For example:

```js
exports.queue = 'test-queue';
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

The options are the same as the configuration mentioned above:

```sh
$ starsky --help

  Usage: starsky [options] consumer_module

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    --config [config_path]       yaml configuration file path
    --mq_exchange [mq_exchange]  rabbitmq exchange name
    --mq_host [mq_host]          rabbitmq host
    --mq_port [mq_port]          rabbitmq port
    --mq_vhost [mq_vhost]        rabbitmq vhost
    --mq_username [mq_username]  rabbitmq username
    --mq_password [mq_password]  rabbitmq password
    --mq_tls [mq_tls]            rabbitmq tls connection
    --mq_tls_cert [mq_tls_cert]  rabbitmq tls cert file path
    --mq_tls_key [mq_tls_key]    rabbitmq tls key file path
```

The one option that will standout there is the `config` option. This can be a yaml configuration file that follows the same format as hutch. This allows you to share the same configuration file in an environment where you may have both starsky & hutch consumers.

## License

MIT
