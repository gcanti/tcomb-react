'use strict';

var t = require('tcomb-validation');

function toPropTypes(Struct) {
  var propTypes = {};
  var props = Struct.meta.props;
  Object.keys(props).forEach(function (k) {
    // React custom prop validator
    // see http://facebook.github.io/react/docs/reusable-components.html
    propTypes[k] = function getPropType(values, name, component) {
      var type = props[name];
      var value = values[name];
      var err = t.validate(value, type).firstError();
      if (err) {
        return new Error(t.util.format('%s is `%s`, should be a `%s`', name, value, t.util.getName(type)));
      }
    }
  });
  return propTypes;
}

module.exports = toPropTypes;