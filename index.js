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
  if (process.env.NODE_ENV !== 'production') {

    var ret = {};
    var isSubtype = (type.meta.kind === 'subtype');
    var props = isSubtype ? type.meta.type.meta.props : type.meta.props;

    Object.keys(props).forEach(function (k) {

      var name = t.getTypeName(props[k]);

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      function checkPropType(values, prop, displayName) {
        var value = values[prop];

        var r = t.validate(value, props[prop]);

        if (!r.isValid()) {
          var parts = [
            'Invalid prop ' + prop + ' supplied to ' + displayName + ', should be a ' + name + '.',
            '',
          ];

          r.errors.forEach(function(e, i) {
            parts.push((i+1) + '. ' + e.message);
          });

          var message = parts.join('\n');

          // add a readable entry in the call stack
          checkPropType.displayName = message;
          t.fail(message);
        }
      }

      // attach the original tcomb definition, so other components can read it
      // via `propTypes.whatever.tcomb`
      checkPropType.tcomb = props[k];

      ret[k] = checkPropType;

    });

    ret.__strict__ = function (values, prop, displayName) {
      var extra = [];

      for (var k in values) {
        if (values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
          extra.push(k);
        }
      }

      if (extra.length > 0) {
        t.fail('Invalid additional prop(s) ' + extra.join(', ') + ' supplied to ' + displayName + '.');
      }
    };

    if (isSubtype) {
      ret.__subtype__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          t.fail('Invalid props ' + stringify(values) + ' supplied to ' + displayName + ', should be a ' + t.getTypeName(type) + '.');
        }
      };
    }

    return ret;

  }
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