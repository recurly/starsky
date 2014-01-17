
var Starsky = require('..').Starsky;

describe('settings', function () {
  describe('.mq-host', function () {
    var starsky = new Starsky();

    it('should default to localhost', function () {
      starsky.get('mq host').should.equal('localhost');
    });

    it('should be configurable', function () {
      starsky.set('mq host', 'whatever');
      starsky.get('mq host').should.equal('whatever');
    });
  });

  describe('.mq-port', function () {
    var starsky = new Starsky();

    it('should default to 5672', function () {
      starsky.get('mq port').should.equal(5672);
    });

    it('should be configurable', function () {
      starsky.set('mq port', 3000);
      starsky.get('mq port').should.equal(3000);
    });
  });

  describe('.mq-vhost', function () {
    var starsky = new Starsky();

    it('should default to "/"', function () {
      starsky.get('mq vhost').should.equal('/');
    });

    it('should be configurable', function () {
      starsky.set('mq vhost', '/abc');
      starsky.get('mq vhost').should.equal('/abc');
    });
  });

  describe('.mq-username', function () {
    var starsky = new Starsky();

    it('should default to "guest"', function () {
      starsky.get('mq username').should.equal('guest');
    });

    it('should be configurable', function () {
      starsky.set('mq username', 'test-user');
      starsky.get('mq username').should.equal('test-user');
    });
  });

  describe('.mq-password', function () {
    var starsky = new Starsky();

    it('should default to "guest"', function () {
      starsky.get('mq password').should.equal('guest');
    });

    it('should be configurable', function () {
      starsky.set('mq password', 'secret');
      starsky.get('mq password').should.equal('secret');
    });
  });
});