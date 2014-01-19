
/*!
 * Module dependencies.
 */

var assert = require('assert');
var snake = require('to-snake-case');
var type = require('component-type');
var debug = require('debug')('starsky:consumer');

/**
 * Export `Consumer`.
 */

module.exports = Consumer;

/**
 * Consumer constructor.
 *
 * TODO: document me...
 *
 * @param {Starsky} starsky
 * @param {String} queue
 * @param {String} topic
 * @constructor
 */

function Consumer (starsky, name, topic) {
  this.starsky = starsky;
  this.name = snake(name);
  this.topic = topic;
  this.inbox = {};
  this.tag = null;
  this.queue = null;
}

/**
 * Initializes the queue, topic bindings and subscription with RabbitMQ. Upon
 * each message receieved, we execute the `consume` function with the message
 * payload and pass the "next" callback.
 *
 * TODO: expose ha-policy
 * TODO: expose prefetch
 *
 * @param {Function} callback
 * @private
 */

Consumer.prototype.consume = function (callback) {
  debug('consume');

  if (!this.starsky.ready) {
    throw new Error('not ready');
  }

  var self = this;
  var starsky = this.starsky;
  var name = this.name;
  var topic = this.topic;
  var consume = this.consume;
  var domain = this.domain;
  var exchange = starsky.config.get('mq exchange');

  var queueOptions = {
      durable: true
    , autoDelete: false
    , arguments: { 'x-ha-policy': 'all' }
  };

  var subscribeOptions = {
      ack: true
    , prefetchCount: 0
  };
  
  starsky.connection.queue(name, queueOptions, function (queue) {
    self.queue = queue;
    queue.bind(exchange, topic, function () {
      var sub = queue.subscribe(subscribeOptions, self.onMessage(callback));
      sub.addCallback(function (ok) {
        self.tag = ok.consumerTag;
      });
    });
  });
};

/**
 * Handles incoming messages.
 *
 * TODO: timeouts?
 *
 * @param {Object} data
 * @param {Object} headers
 * @param {Object} info
 * @param {Message} msg
 * @private
 */

Consumer.prototype.onMessage = function (callback) {
  var self = this;
  return function (data, headers, info, msg) {
    self.inbox[info.messageId] = msg;
    callback(data, function (err) {
      delete self.inbox[info.messageId];
      if (err) {
        msg.reject(msg.redelivered ? false : true);
      } else {
        msg.acknowledge(false);
      }
    });
  };
};

/**
 * Gracefull quit.
 *
 * TODO: timeout
 *
 * @param {Function} callback
 * @private
 */

Consumer.prototype.quit = function (callback) {
  var self = this;

  this.queue.unsubscribe(self.tag);

  function check () {
    var n = Object.keys(self.inbox).length;
    if (0 === n) return done();
    setTimeout(check, 250);
  }

  function done () {
    callback();
  }

  return check();
};