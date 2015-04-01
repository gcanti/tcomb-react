'use strict';

var React = require('react');
var t = require('tcomb-validation');
var format = t.format;

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x) || t.list(ReactNode).is(x);
});

function toPropTypes(type, opts) {

  var ret = {};

  // envify is great
  if (process.env.NODE_ENV !== 'production') {

    opts = opts || {};
    var isSubtype = (type.meta.kind === 'subtype');
    var props = isSubtype ? type.meta.type.meta.props : type.meta.props;

    Object.keys(props).forEach(function (k) {

      var name = t.getTypeName(props[k]);

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      function checkPropType(values, prop, displayName) {
        var value = values[prop];
        if (!t.validate(value, props[prop]).isValid()) {
          var message = format('Invalid prop `%s` = `%s` supplied to `%s`, should be `%s`', prop, value, displayName, name);
          if (opts.debug === true) {
            t.fail(message);
          }
          return new Error(message);
        }
      }

      // add a readable entry in the call stack
      checkPropType.displayName = format('Invalid prop `%s`, should be `%s`', k, name);

      ret[k] = checkPropType;

    });

    // kinda hacky
    if (isSubtype) {
      ret.__all__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          var message = format('Invalid props `%j` supplied to `%s`, should be `%s`', values, displayName, t.getTypeName(type));
          if (opts.debug === true) {
            t.fail(message);
          }
          return new Error(message);
        }
      };
    }

  }

  return ret;
}

t.react = {
  toPropTypes: toPropTypes,
  ReactElement: ReactElement,
  ReactNode: ReactNode
};

module.exports = t;