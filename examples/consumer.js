
var hopper = require('..');

hopper.once('ready', function () {
  var queue = hopper.queue('austin');
  queue.subscribe('some.topic');
  queue.consume(function (msg, done) {
    console.log('%j', msg);
    if (100 === msg.id) {
      done(new Error('uh oh'));
    } else {
      done();
    }
  });
});

hopper.connect();