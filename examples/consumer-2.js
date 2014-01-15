
exports.topic = '#';
exports.queue = 'austin';
exports.consume = function (msg, next) {
  console.log(msg);
  next();
};