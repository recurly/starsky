
exports.queue = 'test-queue';
exports.topic = 'starsky.test';

exports.consume = function (msg, next) {
  console.log('%j', msg);
  setTimeout(next, 1000);
};
