
var Rabbit = require('..').Rabbit;

describe('settings', function () {
  describe('.mq-host', function () {
    var rabbit = new Rabbit();

    it('should default to localhost', function () {
      rabbit.get('mq host').should.equal('localhost');
    });

    it('should be configurable', function () {
      rabbit.set('mq host', 'whatever');
      rabbit.get('mq host').should.equal('whatever');
    });
  });

  describe('.mq-port', function () {
    var rabbit = new Rabbit();

    it('should default to 5672', function () {
      rabbit.get('mq port').should.equal(5672);
    });

    it('should be configurable', function () {
      rabbit.set('mq port', 3000);
      rabbit.get('mq port').should.equal(3000);
    });
  });

  describe('.mq-vhost', function () {
    var rabbit = new Rabbit();

    it('should default to "/"', function () {
      rabbit.get('mq vhost').should.equal('/');
    });

    it('should be configurable', function () {
      rabbit.set('mq vhost', '/abc');
      rabbit.get('mq vhost').should.equal('/abc');
    });
  });

  describe('.mq-username', function () {
    var rabbit = new Rabbit();

    it('should default to "guest"', function () {
      rabbit.get('mq username').should.equal('guest');
    });

    it('should be configurable', function () {
      rabbit.set('mq username', 'test-user');
      rabbit.get('mq username').should.equal('test-user');
    });
  });

  describe('.mq-password', function () {
    var rabbit = new Rabbit();

    it('should default to "guest"', function () {
      rabbit.get('mq password').should.equal('guest');
    });

    it('should be configurable', function () {
      rabbit.set('mq password', 'secret');
      rabbit.get('mq password').should.equal('secret');
    });
  });

  describe('.log-level', function () {
    var rabbit = new Rabbit();

    it('should default to "info"', function () {
      rabbit.get('log level').should.equal('info');
    });

    it('should be configurable', function () {
      rabbit.set('log level', 'fatal');
      rabbit.get('log level').should.equal('fatal');
    });
  });
});