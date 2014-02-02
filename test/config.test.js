
var Config = require('../lib/config');
var path = require('path');

describe('Config', function () {
  describe('mq host', function () {
    var config = new Config();

    it('should default to localhost', function () {
      config.get('mq host').should.equal('localhost');
    });

    it('should be configurable', function () {
      config.set('mq host', 'whatever');
      config.get('mq host').should.equal('whatever');
    });
  });

  describe('mq port', function () {
    var config = new Config();

    it('should default to 5672', function () {
      config.get('mq port').should.equal(5672);
    });

    it('should be configurable', function () {
      config.set('mq port', 3000);
      config.get('mq port').should.equal(3000);
    });
  });

  describe('mq vhost', function () {
    var config = new Config();

    it('should default to "/"', function () {
      config.get('mq vhost').should.equal('/');
    });

    it('should be configurable', function () {
      config.set('mq vhost', '/abc');
      config.get('mq vhost').should.equal('/abc');
    });
  });

  describe('mq username', function () {
    var config = new Config();

    it('should default to "guest"', function () {
      config.get('mq username').should.equal('guest');
    });

    it('should be configurable', function () {
      config.set('mq username', 'test-user');
      config.get('mq username').should.equal('test-user');
    });
  });

  describe('mq password', function () {
    var config = new Config();

    it('should default to "guest"', function () {
      config.get('mq password').should.equal('guest');
    });

    it('should be configurable', function () {
      config.set('mq password', 'secret');
      config.get('mq password').should.equal('secret');
    });
  });

  describe('mq tls', function () {
    var config = new Config();

    it('should default to false', function () {
      config.get('mq tls').should.equal(false);
    });

    it('should be configurable', function () {
      config.set('mq tls', true);
      config.get('mq tls').should.equal(true);
    });
  });

  describe('load', function () {
    it('should load from a YAML file', function () {
      var config = new Config();
      config.load(path.resolve(__dirname, './fixtures/config.yml'));
      config.get('namespace').should.equal('demo');
      config.get('mq host').should.equal('somehost');
      config.get('mq port').should.equal(3000);
      config.get('mq exchange').should.equal('test');
      config.get('mq vhost').should.equal('/test');
      config.get('mq tls').should.equal(true);
      config.get('mq username').should.equal('u');
      config.get('mq password').should.equal('p');
      config.get('mq tls cert').should.equal('/cert/path');
      config.get('mq tls key').should.equal('/key/path');
    });

    it('should load from a JSON file', function () {
      var config = new Config();
      config.load(path.resolve(__dirname, './fixtures/config.json'));
      config.get('namespace').should.equal('demo');
      config.get('mq host').should.equal('somehost');
      config.get('mq port').should.equal(3000);
      config.get('mq exchange').should.equal('test');
      config.get('mq vhost').should.equal('/test');
      config.get('mq tls').should.equal(true);
      config.get('mq username').should.equal('u');
      config.get('mq password').should.equal('p');
      config.get('mq tls cert').should.equal('/cert/path');
      config.get('mq tls key').should.equal('/key/path');
    });

    it('should load from an object', function () {
      var config = new Config();
      config.set({
          'mq host': 'somehost'
        , 'mq port': 3000
        , 'mq exchange': 'test'
      });
      config.get('mq host').should.equal('somehost');
      config.get('mq port').should.equal(3000);
      config.get('mq exchange').should.equal('test');
    });
  });
});
