
var starsky = require('..');

starsky.set('mq host', 'localhost');
starsky.set('mq port', 5672);
starsky.set('exchange', 'demo');

setInterval(function () {
  starsky.publish('log.info', {
    hello: 'world'
  }, confirm);
}, 100);

function confirm (err) {
  if (err) console.error(err.message);
}

starsky.connect();
