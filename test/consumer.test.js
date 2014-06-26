var Starsky = require('..').Starsky;
var sinon = require('sinon');

describe('Consumer', function () {
  describe('.consume()', function () {
    it('should throw when not ready', function (done) {
      var starsky = new Starsky();
      var consumer = starsky.consumer('test');
      ;(function () {
        consumer.process();
      }).should.throw('not ready');
      done();
    });

    it('should invoke the consumer fn on each message', function (done) {
      var starsky = new Starsky();
      starsky.connect(function () {
        var consumer = starsky.consumer('test-2');

        consumer.subscribe('foo.bar');
        consumer.process(function (msg, next) {
          msg.should.have.property('id');
          msg.should.have.property('timestamp');
          msg.should.have.property('topic', 'foo.bar');
          msg.body.should.have.property('hello', 'world');
          next();
          done();
        });

        consumer.once('ready', function () {
          starsky.publish('foo.bar', { hello: 'world' });
        });
      });
    });

    it('configures queues with dead letter exchanges', function (done) {
      var starsky = new Starsky();
      starsky.connect(function () {
        var consumer = starsky.consumer('test-3', { 'x-dead-letter-exchange': 'test.dlx' });
        sinon.spy(starsky.connection, 'queue');
        consumer.subscribe('foo.bar');
        consumer.process(function() { });
        consumer.once('ready', function() {
          starsky.connection.queue.firstCall.args[1].should.eql({
            durable: true,
            autoDelete: false,
            arguments: { 'x-dead-letter-exchange': 'test.dlx' }
          });
          done();
        });
      });
    });
  });
});
