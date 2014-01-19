
var Message = require('../lib/message');

describe('Message', function () {
  var msg = new Message('a.b', { test: 'test' });

  it('should set topic', function (done) {
    msg.topic.should.equal('a.b');
    done();
  });

  it('should set data', function (done) {
    msg.data.should.exist;
    msg.data.test.should.equal('test');
    done();
  });

  it('should set deliveryMode', function (done) {
    msg.options.deliveryMode.should.equal(1);
    done();
  });

  it('should set messageId', function (done) {
    msg.options.messageId.should.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
    done()
  });

  it('should set timestamp', function (done) {
    msg.options.timestamp.should.exist;
    done();
  });
});