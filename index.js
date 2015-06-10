'use strict';

var t = require('tcomb-validation');
var noop = function () {};

function stringify(x) {
  try { // handle "Converting circular structure to JSON" error
    return JSON.stringify(x);
  } catch (e) {
    return String(x);
  }
}

function propTypes(type) {
  var ret = {};
  var isSubtype = (type.meta.kind === 'subtype');
  var props = isSubtype ? type.meta.type.meta.props : type.meta.props;

  Object.keys(props).forEach(function (k) {
    var name = t.getTypeName(props[k]);

    var checkPropType = function() {};

    if (process.env.NODE_ENV !== 'production') {
      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      checkPropType = function checkPropType(values, prop, displayName) {
        var value = values[prop];
        if (!t.validate(value, props[prop]).isValid()) {
          var message = 'Invalid prop ' + prop + ' = ' + value + ' supplied to ' + displayName + ', should be a ' + name + '.';
          // add a readable entry in the call stack
          checkPropType.displayName = message;
          t.fail(message);
        }
      };
    }

    // attach the original tcomb definition, so other components can read it
    // via `propTypes.whatever.tcomb`
    checkPropType.tcomb = props[k];

    ret[k] = checkPropType;
  });

  if (process.env.NODE_ENV !== 'production') {
    ret.__strict__ = function (values, prop, displayName) {
      for (var k in values) {
        if (values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
          t.fail('Invalid additional prop ' + k + ' supplied to ' + displayName + '.');
        }
      }
    };

    if (isSubtype) {
      ret.__subtype__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          t.fail('Invalid props ' + stringify(values) + ' supplied to ' + displayName + ', should be a ' + t.getTypeName(type) + '.');
        }
      };
    }
  }

  return ret;
}

// ES7 decorator
// in production will be a noop
function props(Type) {
  if (process.env.NODE_ENV !== 'production') {
    if (!t.isType(Type)) {
      Type = t.struct(Type);
    }
    return function (Component) {
      Component.propTypes = propTypes(Type);
    };
  } else {
    return noop;
  }
}

module.exports = {
  propTypes: propTypes,
  props: props
};