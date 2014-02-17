
/*!
 * Module dependencies.
 */

var fs = require('fs');
var yaml = require('js-yaml');
var uuid = require('node-uuid');
var Config = require('./config');
var Message = require('./message');
var Consumer = require('./consumer');
var pkg = require('../package.json');
var type = require('component-type');
var debug = require('debug')('starsky');
var Connection = require('amqp').Connection;
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
  this.connection = new Connection();
}

/**
 * Inherits `EventEmitter`.
 */

Starsky.prototype.__proto__ = EventEmitter.prototype;

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
    , username: config.get('mq username')
    , password: config.get('mq password')
    , vhost: encodeURIComponent(config.get('mq vhost'))
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

  this.connection.connect(options);
  this.connection.on('error', this.onConnectionError.bind(this));
  this.connection.on('close', this.onConnectionClose.bind(this));
  this.connection.on('ready', this.onConnectionReady.bind(this));
};

/**
 * Ends the `connection`.
 *
 * TODO: https://github.com/postwait/node-amqp/pull/285
 *
 * @public
 */

Starsky.prototype.disconnect = function () {
  debug('disconnect');
  this.connection.end();
};

/**
 * Publishes the `data`.
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
 * @param {String} topic
 * @param {Function} consume
 * @private
 */

Starsky.prototype.consumer = function (queue, topic) {
  return new Consumer(this, queue, topic);
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
 * Config `load` alias.
 *
 * @see Config#set
 */

Starsky.prototype.configure =
Starsky.prototype.load = function (file) {
  this.config.load(file);
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
