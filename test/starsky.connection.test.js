
var Starsky = require('..').Starsky;

describe('connection', function () {
  describe('.connect()', function () {
    it('should emit "connect"', function (done) {
      var starsky = new Starsky();
      starsky.on('connect', done);
      starsky.connect();
    });
  });

  describe('.close()', function () {
    it('should emit "close"', function (done) {
      var starsky = new Starsky();
      starsky.on('close', done);
      starsky.on('ready', starsky.close);
      starsky.connect();
    })
  });
});