
var Rabbit = require('..').Rabbit;

describe('connection', function () {
  describe('.connect()', function () {
    it('should emit "connect"', function (done) {
      var rabbit = new Rabbit();
      rabbit.on('connect', done);
      rabbit.connect();
    });
  });

  describe('.close()', function () {
    it('should emit "close"', function (done) {
      var rabbit = new Rabbit();
      rabbit.on('close', done);
      rabbit.on('ready', rabbit.close);
      rabbit.connect();
    })
  });
});