
var Starsky = require('..').Starsky;

describe('Consumer', function () {
  describe('.consume()', function () {
    it('should throw when not ready', function (done) {
      var starsky = new Starsky();
      var consumer = starsky.consumer('test', 'a.b');
      ;(function () {
        consumer.consume();
      }).should.throw('not ready');
      done();
    });

    it('should invoke the consumer fn on each message', function (done) {
      var starsky = new Starsky();
      starsky.connect(function () {
        var consumer = starsky.consumer('test-2');

        consumer.subscribe('foo.bar');
        consumer.consume(function (msg, next) {
          msg.should.have.property('id');
          msg.should.have.property('timestamp');
          msg.should.have.property('topic', 'foo.bar');
          msg.body.should.have.property('hello', 'world');
          next();
          done();
        });

        // hack... need to expose consumer creation events or something.
        setTimeout(function () {
          starsky.publish('foo.bar', {
            hello: 'world'
          });
        }, 50);
      });
    });
  });
});
