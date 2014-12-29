'use strict';

var React = require('react');
var t = require('tcomb-validation');
var format = t.util.format;

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x) || t.list(ReactNode).is(x);
});

function toPropTypes(type, opts) {

  var propTypes = {};

  if (process.env.NODE_ENV !== 'production') {

    opts = opts || {};
    var props = type.meta.props;

    Object.keys(props).forEach(function (k) {

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      var type = props[k];
      var name = t.util.getName(type);

      function checkPropType(values, prop, displayName) {
        var value = values[prop];
        var isValid = t.validate(value, type).isValid();
        if (!isValid) {
          var message = format('Invalid prop `%s` = `%s` supplied to `%s`, should be `%s`', prop, value, displayName, name);
          if (opts.debug === true) {
            t.fail(message);
          }
          return new Error(message);
        }
      }

      checkPropType.displayName = format('Invalid prop `%s`, should be `%s`', k, name);

      propTypes[k] = checkPropType;

    });

  }

  return propTypes;
}

t.react = {
  toPropTypes: toPropTypes,
  ReactElement: ReactElement,
  ReactNode: ReactNode
};

module.exports = t;