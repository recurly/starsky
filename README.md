
# rabbit-node

A higher level and opinionated library on top of [node-amqp](https://github.com/postwait/node-amqp).

### Install

```sh
$ make
```

### Test

```sh
$ make test
```

### Code Coverage

```sh
$ make test-cov
```

### Example:

*Producer:*

```js
var rabbit = require('..');
var exchange = rabbit.topic('bus');

setInterval(function () {
  exchange.send('user.email.change', {
      user: 'foo'
    , email: 'new@email.com'
    , previous: 'old@email.com'
  }, confirm);
}, 1000);

function confirm (err) {
  if (err) console.err(err.stack);
}

rabbit.connect('amqp://localhost:5672');
```

*Consumer:*

```js
var rabbit = require('..');

var exchange = rabbit.topic('bus');
var queue = rabbit.queue('webhook');

queue.bind('bus', '#');
queue.on('message', function (msg, done) {
  console.log('%j', msg);
  done();
});

rabbit.connect('amqp://localhost:5672');
```