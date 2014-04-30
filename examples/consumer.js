
var starsky = require('..');
var consumer = starsky.consumer('test-consumer');

starsky.set('mq host', 'localhost');
starsky.set('mq port', 5672);
starsky.set('exchange', 'demo');

starsky.on('connect', function () {
  consumer.subscribe('starsky.test');
  consumer.process(function (msg, next) {
    console.log('%j', msg.body);
    next();
  });
});

starsky.connect();
