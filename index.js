
module.exports = process.env.LIB_COV
  ? require('./lib-cov/rabbit')
  : require('./lib/rabbit');