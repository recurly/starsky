
/*!
 * Module dependencies.
 */

var Domain = require('domain');

/**
 * Export `Queue`.
 */

module.exports = Queue;

/**
 * Queue constructor.
 *
 * TODO: document me...
 *
 * @constructor
 * @public
 */

function Queue (name, starsky) {
  this.name = name;
  this.starsky = starsky;
  this.logger = starsky.logger;
  this.subscriptions = [];
  this.callback = null;
  this.queue = null;
}

/**
 * Adds a `topic` to subscribe to.
 *
 * @param {String} topic
 * @return {Queue}
 * @public
 */

Queue.prototype.subscribe = function (topic) {
  this.logger.debug('subscribe - %s', topic);
  this.subscriptions.push(topic);
  return this;
};

/**
 * Eat messages.
 *
 * TODO: expose ha-policy setting.
 * TODO: expose prefetch setting.
 *
 * @param {Function} callback
 * @public
 */

Queue.prototype.consume = function (callback) {
  if (!this.starsky.ready) throw new Error('not ready');

  this.callback = callback;

  var exchange = this.starsky.get('mq exchange');
  var connection = this.starsky.connection;
  var subscriptions = this.subscriptions;
  var name = this.name;

  var queueOptions = {
      durable: true
    , passive: false
    , autoDelete: false
    , arguments: { 'x-ha-policy': 'all' }
  };

  var subscribeOptions = {
      ack: true
    , prefetchCount: 0
  };

  connection.queue(name, queueOptions, function (queue) {
    this.queue = queue;
    queue.subscribe(subscribeOptions, this.onMessage.bind(this));
    subscriptions.forEach(function (topic) {
      queue.bind(exchange, topic);
    });
  }.bind(this));
};

/**
 * Handles the incoming messages from `Queue.subscribe`.
 *
 * TODO: Handle the info.parseError, this would happen if someone
 * sends the content type of json but put invalid json in the body.
 * We don't really want to emit this to the app level consumer, so
 * we should do *something* with it I would imagine. See this for
 * details: https://github.com/postwait/node-amqp/blob/master/lib/Queue.js#L154.
 *
 * TODO: timeouts?
 * TODO: retries?
 *
 * @param {Object} data
 * @param {Object} headers
 * @param {Object} info
 * @param {Message} msg
 * @private
 */

Queue.prototype.onMessage = function (data, headers, info, msg) {
  var domain = Domain.create();
  var callback = domain.bind(this.callback);
  var self = this;

  domain.on('error', function (err) {
    self.logger.error(err);
    msg.reject(true, false);
  });

  callback(data, domain.intercept(function () {
    msg.acknowledge();
  }));
};