
var sinon = require('sinon');
var Starsky = require('..').Starsky;
var Consumer = require('../lib/consumer');

describe('Starsky', function () {
  describe('.connect()', function () {
    it('should emit "connect"', function (done) {
      var starsky = new Starsky();
      starsky.on('connect', done);
      starsky.connect();
    });

     it('should invoke the callback', function (done) {
      var starsky = new Starsky();
      var spy = sinon.spy();

      starsky.connect(spy);
      starsky.on('connect', function () {
        spy.calledOnce.should.equal(true);
        done();
      });
    });
  });

  describe('.disconnect()', function () {

    it('should emit "disconnect"', function (done) {
      var starsky = new Starsky();
      starsky.on('error', function(err){console.log(err)});
      starsky.on('disconnect', done);
      starsky.on('connect', starsky.disconnect);
      starsky.connect();
    })

    it('should disconnect even if there are unconnected consumers', function(done) {
      var starsky = new Starsky();
      starsky.on('error', function(err){console.log(err)});
      starsky.on('disconnect', done);
      starsky.on('connect', starsky.disconnect);
      starsky.consumer('test-consumer');
      starsky.connect();
    })

    it('should call the callback supplied to disconnect', function(done) {
      var starsky = new Starsky();
      starsky.on('error', function(err){console.log(err)});
      starsky.on('connect', function() {
        starsky.disconnect(done);
      });
      starsky.connect();
    });
  });

  describe('.set()', function () {
    var starsky = new Starsky();

    before(function () {
      sinon.stub(starsky.config, 'set');
    });

    after(function () {
      starsky.config.set.restore();
    });

    it('should proxy to config.set()', function () {
      starsky.set('mq host', 'whatever');
      starsky.config.set.calledWith('mq host', 'whatever').should.equal(true);
    });
  });

  describe('.get()', function () {
    var starsky = new Starsky();

    before(function () {
      sinon.stub(starsky.config, 'get');
    });

    after(function () {
      starsky.config.get.restore();
    });

    it('should proxy to config.get()', function () {
      starsky.get('namespace');
      starsky.config.get.calledWith('namespace').should.equal(true);
    });
  });

  describe('.publish()', function () {
    describe('before connected', function () {
      it('should callback() with an error', function (done) {
        var starsky = new Starsky();
        starsky.publish('test', { a: 'a' }, function (err) {
          err.should.have.property('message', 'not ready');
          done();
        });
      });
    });

    describe('once connected', function () {
      it('should callback() with no error', function () {
        var starsky = new Starsky();
        starsky.connect(function () {
          starsky.publish('test', { a: 'a' }, function (err) {
            if (err) return done(err);
            done();
          });
        });
      });
    });
  });

  describe('.consumer()', function () {
    var starsky = new Starsky();
    var consumer = starsky.consumer('test-name');

    it('should be a consumer', function (done) {
      consumer.should.be.instanceof(Consumer);
      done();
    });

    it('should have a snake-cased name', function (done) {
      consumer.should.have.property('name', 'test_name');
      done();
    });

    it('should have no topics', function (done) {
      consumer.topics.should.have.length(0);
      done();
    });

    it('should not have a queue yet', function (done) {
      consumer.should.have.property('queue', null);
      done();
    });
  });

});
