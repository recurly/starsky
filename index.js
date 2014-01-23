module.exports = process.env.LIB_COV
  ? require('./lib-cov/starsky')
  : require('./lib/starsky');