
var starsky = require('..');
var consumer = starsky.consumer('log-info-consumer');

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
