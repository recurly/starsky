
var starsky = require('..');

starsky.once('ready', function () {
  starsky.publish('email.send', {
      email: 'test@email.com'
    , body: 'hello world'
  }, confirm);
});

function confirm (err) {
  if (err) console.error(err.stack);
}

starsky.connect();