'use strict';

var React = require('react');
var t = require('tcomb-validation');

function stringify(x) {
  try { // handle "Converting circular structure to JSON" error
    return JSON.stringify(x);
  } catch (e) {
    return String(x);
  }
}

function getPropTypes(type) {

  // can also accept an object
  if (!t.isType(type)) {
    type = t.struct(type);
  }

  var propTypes = {};
  var isSubtype = (type.meta.kind === 'subtype');
  var props = isSubtype ? type.meta.type.meta.props : type.meta.props;

  Object.keys(props).forEach(function (k) {
    var name = t.getTypeName(props[k]);

    var checkPropType = function () {};

    if (process.env.NODE_ENV !== 'production') {

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      checkPropType = function (values, prop, displayName) {
        var value = values[prop];

        var r = t.validate(value, props[prop]);

        if (!r.isValid()) {
          var parts = [
            'Invalid prop ' + stringify(prop) + ' supplied to ' + displayName + ', should be a ' + name + '.\n',
            'Detected errors (' + r.errors.length + '):\n'
          ];

          r.errors.forEach(function(e, i) {
            parts.push(' ' + (i + 1) + '. ' + e.message);
          });

          var message = parts.join('\n') + '\n\n';

          // add a readable entry in the call stack
          checkPropType.displayName = message;
          t.fail(message);
        }
      };
    }

    // attach the original tcomb definition, so other components can read it
    // via `propTypes.whatever.tcomb`
    checkPropType.tcomb = props[k];

    propTypes[k] = checkPropType;
  });

  if (process.env.NODE_ENV !== 'production') {
    propTypes.__strict__ = function (values, prop, displayName) {
      var extra = [];

      for (var k in values) {
        if (k !== '__strict__' && k !== '__subtype__' && values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
          extra.push(k);
        }
      }

      if (extra.length > 0) {
        t.fail('Invalid additional prop(s) ' + stringify(extra) + ' supplied to ' + displayName + '.');
      }
    };

    if (isSubtype) {
      propTypes.__subtype__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          t.fail('Invalid props ' + stringify(values) + ' supplied to ' + displayName + ', should be a ' + t.getTypeName(type) + '.');
        }
      };
    }
  }

  return propTypes;
}

function es7PropsDecorator(type) {
  return function (Component) {
    Component.propTypes = getPropTypes(type);
  };
}

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x) || t.list(ReactNode).is(x);
});

t.ReactElement = ReactElement;
t.ReactNode = ReactNode;

module.exports = {
  t: t,
  propTypes: getPropTypes,
  props: es7PropsDecorator,
  ReactElement: ReactElement, // deprecated
  ReactNode: ReactNode  // deprecated
};
