
var starsky = require('..');

starsky.once('ready', function () {
  starsky.send('email.send', {
      email: 'test@email.com'
    , body: 'hello world'
  }, confirm);
});

function confirm (err) {
  if (err) console.error(err.stack);
}

starsky.connect();