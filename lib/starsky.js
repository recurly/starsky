
/*!
 * Module dependencies.
 */

var os = require('os');
var uuid = require('node-uuid');
var debug = require('debug')('starsky');
var Configurable = require('configurable');
var Connection = require('amqp').Connection;
var EventEmitter = require('events').EventEmitter;
var Queue = require('./queue');

/**
 * Starsky.
 *
 * TODO: document events
 *
 * @constructor
 * @public
 */

function Starsky () {
  if (!(this instanceof Starsky)) return new Starsky();
  this.connection = new Connection();
  this.consumers = {};
  this.exchange = null;
  this.settings = {
      'mq exchange': 'services'
    , 'mq host': 'localhost'
    , 'mq port': 5672
    , 'mq vhost': '/'
    , 'mq username': 'guest'
    , 'mq password': 'guest'
    , 'mq tls': false
    , 'mq tls cert': null
    , 'mq tls key': null
    , 'mq api host': 'localhost'
    , 'mq api port': 15672
    , 'mq api ssl': false
  };
}

/**
 * Inherits `EventEmitter`.
 */

Starsky.prototype.__proto__ = EventEmitter.prototype;

/**
 * Mixin `Configurable`.
 */

Configurable(Starsky.prototype);

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
 * Establishes the `connection` with the mq-server.
 *
 * @public
 */

Starsky.prototype.connect = function () {

  var settings = {
      host: this.get('mq host')
    , port: this.get('mq port')
    , username: this.get('mq username')
    , password: this.get('mq password')
    , vhost: encodeURIComponent(this.get('mq vhost'))
    , ssl: {
        enabled: !!this.get('mq tls')
      , keyFile: this.get('mq tls key')
      , certFile: this.get('mq tls cert')
    }
    , heartbeat: 30
  };

  debug('connect');
  this.connection.connect(settings);
  this.connection.on('connect', this.onConnection.bind(this));
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
  debug('connection closing');
  this.connection.end();
};

/**
 * Sends the `msg`.
 *
 * @param {String} topic
 * @param {Object} msg
 * @param {Function} callback
 * @public
 */

Starsky.prototype.publish = function (topic, msg, callback) {
  if (!this.ready) return callback(new Error('not ready'));

  var opts = {
      deliveryMode: 2
    , messageId: uuid.v4()
    , timestamp: Date.now()
    , contentType: 'application/json'
  };

  this.exchange.publish(topic, msg, opts, callback);
};

/**
 * Creates a new `Queue` with `name`.
 *
 * @param {String} name
 * @throws {Error}
 * @public
 */

Starsky.prototype.queue = function (name) {
  if (!name) throw new Error('name required');
  return new Queue(name, this);
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

  var name = this.get('mq exchange');
  var opts = {
      type: 'topic'
    , confirm: true
    , passive: false
    , durable: true
    , autoDelete: false
  };

  this.connection.exchange(name, opts, function (exchange) {
    debug('exchange open');
    this.exchange = exchange;
    this.emit('ready');
  }.bind(this));
};

/**
 * Listener for the "connect" event from `connection`.
 *
 * @private
 */

Starsky.prototype.onConnection = function () {
  debug('connect');
  this.emit('connect');
};

/**
 * Listener for the `close` event from `connection`.
 *
 * @private
 */

Starsky.prototype.onConnectionClose = function () {
  debug('connection closed');
  this.emit('close');
};

/**
 * Listener for the `error` event from `connection`.
 *
 * @private
 */

Starsky.prototype.onConnectionError = function (err) {
  debug('error %s', err);
  this.emit('error', err);
};

/**
 * Attach the `Starsky` constructor as a property so
 * we can create multiple instances if needed. This
 * is mainly to support testing, you should use the
 * singleton exported by this module in your day-to-day
 * applications.
 *
 * @private
 */

Starsky.prototype.Starsky = Starsky;

/**
 * Export a `Starsky` singleton.
 */

module.exports = exports = new Starsky();