
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
  var namespace = starsky.get('namespace');
  var name = this.name;
  var topic = this.topic;
  var consume = this.consume;
  var domain = this.domain;
  var exchange = starsky.get('mq exchange');
  var prefetch = starsky.get('prefetch');

  var queueOptions = {
      durable: true
    , autoDelete: false
  };

  var subscribeOptions = {
      ack: true
    , prefetchCount: prefetch
  };

  if (namespace) {
    name = namespace + ':' + name;
  }

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
    // keep track of messages in-process, see quit()
    self.inbox[info.messageId] = msg;

    callback(data, function (err) {
      delete self.inbox[info.messageId];
      if (err) {
        // only requeue once (e.g not a "re-delivery")
        // https://github.com/postwait/node-amqp/blob/master/lib/message.js#L61
        msg.reject(msg.redelivered ? false : true);
      } else {
        // only ack this message and not all previous messages
        // https://github.com/postwait/node-amqp/blob/master/lib/message.js#L51
        msg.acknowledge(false);
      }
    });
  };
};

/**
 * Unsubscribes the `queue` and waits until all in-process
 * messages have been completed. Once the `callback` returns
 * control to you, you can safely exit the process.
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
