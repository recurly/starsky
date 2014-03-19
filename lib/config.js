
/*!
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var space = require('to-space-case');

/**
 * Export `Config`.
 */

module.exports = Config;

/**
 * Configuration constructor.
 *
 * TODO: document me
 *
 * @constructor
 * @public
 */

function Config () {
  this.settings = {
      'mq host': 'localhost'
    , 'mq port': 5672
    , 'mq exchange': 'starsky'
    , 'mq vhost': '/'
    , 'mq tls': false
    , 'mq tls cert': null
    , 'mq tls key': null
    , 'mq username': 'guest'
    , 'mq password': 'guest'
    , 'namespace': null
    , 'prefetch': 0
  };
}

/**
 * Sets the setting `option` with `value`.
 *
 * @param {String|Object} option
 * @param {Mixed} [value]
 * @public
 */

Config.prototype.set = function (option, value) {
  if ('object' == typeof option) {
    for (var key in option) {
      this.set(key, option[key]);
    }
  } else {
    this.settings[space(option)] = value;
  }
};

/**
 * Gets the setting `option`.
 *
 * @param {String} option
 * @return {Mixed}
 * @public
 */

Config.prototype.get = function (option) {
  return this.settings[option];
};

/**
 * Load from either a yaml or json file.
 *
 * @param {String} filepath
 * @public
 */

Config.prototype.load = function (filepath) {
  var contents = fs.readFileSync(filepath, 'utf8');
  var options = '.yml' == path.extname(filepath)
    ? yaml.load(contents)
    : JSON.parse(contents);

  Object.keys(options).forEach(function (key) {
    this.set(key, options[key]);
  }, this);
};
