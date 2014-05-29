
/*!
 * Module dependencies.
 */

var amqp = require('amqp');
var util = require('util');
var uuid = require('node-uuid');
var Config = require('./config');
var Message = require('./message');
var Consumer = require('./consumer');
var pkg = require('../package.json');
var type = require('component-type');
var debug = require('debug')('starsky');
var EventEmitter = require('events').EventEmitter;

/**
 * Starsky constructor
 *
 * TODO: document me...
 *
 * @constructor
 */

function Starsky () {
  if (!(this instanceof Starsky)) return new Starsky();
  this.version = pkg.version;
  this.config = new Config();
  this.consumers = {};
  EventEmitter.call(this);
}

/**
 * Inherits `EventEmitter`.
 */

util.inherits(Starsky, EventEmitter);

/**
 * Ready state.
 *
 * @var {Boolean}
 * @readOnly
 * @public
 */

Object.defineProperty(Starsky.prototype, 'ready', {
  get: function () {
    return this.exchange && 'open' === this.exchange.state;
  }
});

/**
 * Establishes the `connection` with RabbitMQ and initializes all event
 * handlers. If a callback is passed, it will be invoked upon the "ready"
 * event being emitted.
 *
 * @param {Function} callback
 * @public
 */

Starsky.prototype.connect = function (callback) {
  debug('connect');

  var config = this.config;
  var options = {
      host: config.get('mq host')
    , port: config.get('mq port')
    , login: config.get('mq username')
    , password: config.get('mq password')
    , vhost: config.get('mq vhost')
    , heartbeat: config.get('mq heartbeat')
    , ssl: {
        enabled: config.get('mq tls')
      , keyFile: config.get('mq tls key')
      , certFile: config.get('mq tls cert')
    }
  };

  if ('function' == type(callback)) {
    this.on('connect', function listener () {
      this.removeListener('connect', listener);
      callback();
    });
  }

  this.connection = amqp.createConnection(options);
  this.connection.on('error', this.onConnectionError.bind(this));
  this.connection.on('close', this.onConnectionClose.bind(this));
  this.connection.on('ready', this.onConnectionReady.bind(this));
  this.connection.on('heartbeat', this.onConnectionHeartbeat.bind(this));
};

/**
 * Ends the `connection`. Any consumers created will have thier `quit()`
 * method called for you implicitly. This will take care of any cleanup.
 *
 * TODO: https://github.com/postwait/node-amqp/pull/285
 *
 * @public
 */

Starsky.prototype.disconnect = function (callback) {
  debug('disconnect');

  var keys = Object.keys(this.consumers);
  var i = keys.length;
  var self = this;

  callback = callback || noop;

  function done () {
    self.on('disconnect', callback);
    self.connection.end();
  }

  if (0 === i) {
    return done();
  }

  keys.forEach(function (key) {
    self.consumer(key).quit(function () {
      debug('%s quit', key);
      --i || done();
    });
  });
};

/**
 * Publishes the `data`.
 *
 * TODO: Refactor the concept of a message, i dont like it. Ideally
 * we could have a shared message object that works with outgoing and
 * incoming for the consumer side.
 *
 * TODO: thunkable
 *
 * @param {String} topic
 * @param {Object} data
 * @param {Function} callback
 * @public
 */

Starsky.prototype.publish = function (topic, data, options, callback) {
  if ('function' == type(options)) {
    callback = options;
    options = {};
  }

  if ('undefined' == type(callback)) {
    callback = noop;
  }

  if (!this.ready) {
    return callback(new Error('not ready'));
  }

  var msg = new Message(topic, data, options);
  var err = msg.validate();

  if (err) {
    return callback(err);
  }

  this.exchange.publish(msg.topic, msg.data, msg.options, callback);
};

/**
 * Creates a new `Consumer`.
 *
 * @param {String} queue
 * @private
 */

Starsky.prototype.consumer = function (name) {
  return this.consumers[name] || (this.consumers[name] = new Consumer(this, name));
};

/**
 * Listener for the `ready` event from `connection`.
 *
 * TODO: double check the exchange defaults we chose.
 *
 * @private
 */

Starsky.prototype.onConnectionReady = function () {
  debug('connection ready');

  var name = this.config.get('mq exchange');
  var opts = {
      type: 'topic'
    , confirm: true
    , durable: true
    , autoDelete: false
  };

  this.connection.exchange(name, opts, function (exchange) {
    this.exchange = exchange;
    this.emit('connect');
  }.bind(this));
};

/**
 * Config `set` alias.
 *
 * @see Config#set
 */

Starsky.prototype.set = function (option, value) {
  this.config.set(option, value);
};

/**
 * Config `get` alias.
 *
 * @see Config#get
 */

Starsky.prototype.get = function (option) {
  return this.config.get(option);
};

/**
 * Listener for the close events from `connection`.
 *
 * @event disconnect
 * @private
 */

Starsky.prototype.onConnectionClose = function () {
  debug('connection closed');
  this.emit('disconnect');
};

/**
 * Listener for the error events from `connection`.
 *
 * @event error
 * @private
 */

Starsky.prototype.onConnectionError = function (err) {
  debug('connection error: %s', err.message);
  this.emit('error', err);
};

/**
 * Listener for the heartbeat events from `connection`.
 *
 * @event disconnect
 * @private
 */

Starsky.prototype.onConnectionHeartbeat = function () {
  debug('connection heartbeat');
  this.emit('heartbeat');
};

/**
 * Attach the `Starsky` constructor as a property so we can create multiple
 * instances if needed. This is mainly to support testing, you should use the
 * singleton exported by this module in your apps.
 *
 * @private
 */

Starsky.prototype.Starsky = Starsky;

/**
 * Noop.
 *
 * @private
 */

function noop () {
  debug('noop!');
}

/**
 * Export a `Starsky` singleton.
 */

module.exports = exports = new Starsky();
