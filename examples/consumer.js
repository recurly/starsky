
var starsky = require('..');

starsky.once('ready', function () {
  var queue = starsky.queue('email');
  queue.subscribe('email.send');
  queue.consume(function (msg, done) {
    console.log('%j', msg);
    done();
  });
});

starsky.connect();