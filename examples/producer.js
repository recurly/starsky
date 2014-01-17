
var starsky = require('..');

setInterval(function () {
  starsky.publish('starsky.test', {
    subject: 'test message'
  });
}, 1000);

starsky.connect();