
exports.name = 'testconsumer';
exports.topic = 'starsky.test';

exports.consume = function (msg, next) {
  console.log('%j', msg);
  setTimeout(next, 10000);
};
