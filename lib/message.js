
/*!
 * Module dependencies.
 */

var assert = require('assert');
var uuid = require('node-uuid');
var type = require('component-type');
var debug = require('debug')('starsky:message');

/*!
 * Export `Message`.
 */

module.exports = Message;

/**
 * Constructor.
 *
 * TODO: document me.
 *
 * @param {String} topic
 * @param {Object} data
 * @param {Object} opts
 * @constructor
 * @private
 */

function Message (topic, data, options) {
  options = options || {};
  this.topic = topic;
  this.data = data;
  this.options = {
      messageId: options.id || uuid.v4()
    , timestamp: options.timestamp || Date.now()
    , deliveryMode: 'undefined' == type(options.persist) || options.persist
      ? 2
      : 1
  };
}

/**
 * Validation.
 *
 * TODO: better validation (string formats, msg size, etc).
 *
 * @return {Boolean}
 * @private
 */

Message.prototype.validate = function () {
  var error;

  try {
    assert('string' == type(this.topic));
    assert('object' == type(this.data));
  } catch (e) {
    error = e;
  }

  return error;
};
