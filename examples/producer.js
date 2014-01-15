
var hopper = require('..');

hopper.once('ready', function () {
  for (var i = 0; i < 10000; i++) send(i);
});

function send (id) {
  hopper.send('some.topic', {
      id: id
    , user: 'foo'
    , email: 'new@email.com'
    , previous: 'old@email.com'
  }, confirm);
}

function confirm (err) {
  if (err) console.error(err.stack);
}

hopper.connect();