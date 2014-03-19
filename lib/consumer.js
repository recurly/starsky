
/*!
 * Module dependencies.
 */

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
 * @constructor
 */

function Consumer (starsky, name) {
  this.starsky = starsky;
  this.name = snake(name);
  this.topics = [];
  this.inbox = {};
  this.tag = null;
  this.queue = null;
}

/**
 * Adds topics to subscribe to. Note that this only works prior
 * to the queue being created after calling `consume`.
 *
 * @param {String|Array} topic
 */

Consumer.prototype.subscribe = function (topic) {
  if (Array.isArray(topic)) {
    this.topics = this.topics.concat(topic);
  } else {
    this.topics.push(topic);
  }
  return this;
};

/**
 * Initializes the queue, topic bindings and subscription with RabbitMQ. Upon
 * each message receieved, we execute the `consume` function with the message
 * payload and pass the "next" callback.
 *
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

  var name = this.name;
  var namespace = this.starsky.get('namespace');
  var options = { durable: true, autoDelete: false };

  if (namespace) {
    name = namespace + ':' + name;
  }

  this.starsky.connection.queue(name, options, function (queue) {
    debug('queue declared');

    var exchange = this.starsky.get('mq exchange');
    var self = this;

    this.queue = queue;
    this.topics.forEach(bind);

    function bind (topic) {
      debug('bind %s', topic);
      self.queue.bind(exchange, topic, next);
    }

    function next () {
      debug('next');
      subscribe();
    }

    function subscribe () {
      debug('subscribe');
      var prefetch = self.starsky.get('prefetch');
      var options = { ack: true , prefetchCount: prefetch };
      var consumer = queue.subscribe(options, self.onMessage(callback));
      consumer.addCallback(tag);
    }

    function tag (ok) {
      debug('tag');
      self.tag = ok.consumerTag;
    }
  }.bind(this));
};

/**
 * Handles incoming messages.
 *
 * TODO: timeouts?
 *
 * TODO: the packet thing was a hack for a hackathon actually, so
 * we need to actully implement the rest of it.
 *
 * @param {Object} data
 * @param {Object} headers
 * @param {Object} info
 * @param {Message} msg
 * @private
 */

Consumer.prototype.onMessage = function (callback) {
  var self = this;
  return function (body, headers, info, msg) {
    // just the essentials needed for the callback
    var packet = {
      id: info.messageId,
      body: body,
      timestamp: info.timestamp,
      topic: msg.routingKey
    };

    // keep track of packets in-process, see quit()
    self.inbox[packet.id] = packet;

    callback(packet, function (err) {
      delete self.inbox[packet.id];
      if (err) {
        msg.reject();
      } else {
        msg.acknowledge();
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
    setTimeout(check, 100);
  }

  function done () {
    callback();
  }

  debug('quit');

  return check();
};
