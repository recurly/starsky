
/**
 * This is an example of leveraging the bin script.
 *
 * Usage:
 *
 *  $ ./bin/starsky [options] ./examples/consumer-2.js
 */

exports.queue = 'email';
exports.topic = 'email.send';
exports.consume = function (msg, next) {
  console.log(msg);
  next();
};