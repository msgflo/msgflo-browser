var querystring = require('querystring');

module.exports = {
  mqtt: require('./src/mqtt'),
  participant: require('./src/participant'),
  options: function (defaults) {
    if (!defaults) {
      defaults = {};
    }
    if (!defaults.broker) {
      defaults.broker = 'mqtt://localhost';
    }
    if (!window.location.search) {
      return defaults;
    }
    var params = querystring.parse(window.location.search.substr(1));
    var options = {};
    for (var key in defaults) {
      var msgfloKey = 'msgflo_' + key
      if (params[msgfloKey]) {
        options[key] = params[msgfloKey];
        continue;
      }
      options[key] = defaults[key];
    }
    return options;
  }
}
