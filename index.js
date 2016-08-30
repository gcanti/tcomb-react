var React = require('react');
var t = require('tcomb-validation');

function getMessage(errors, what, displayName, type) {
  return [
    'Invalid ' + what + ' supplied to ' + displayName + ', should be a ' + t.getTypeName(type) + '.\n',
    'Detected errors (' + errors.length + '):\n'
  ].concat(errors.map(function (e, i) {
    return ' ' + (i + 1) + '. ' + e.message;
  })).join('\n') + '\n\n';
}

//
// main function
//

function getPropTypes(type, options) {

  // getPropTypes can also accept a dictionary prop -> type
  if (t.Object.is(type)) {
    type = t.struct(type);
  }

  var isSubtype = ( type.meta.kind === 'subtype' );

  // here type should be a struct or a subtype of a struct
  if (process.env.NODE_ENV !== 'production') {
    t.assert(
      t.isType(type),
      '[tcomb-react] Invalid argument type supplied to propTypes()'
    );
  }

  var propTypes = {};
  var innerType = isSubtype ? type.meta.type : type;

  if (innerType.meta.kind === 'struct' || innerType.meta.kind === 'interface') {
    var props = innerType.meta.props;

    Object.keys(props).forEach(function (k) {

      var propType = props[k];
      var checkPropType;

      if (process.env.NODE_ENV !== 'production') {

        // React custom prop validators
        // see http://facebook.github.io/react/docs/reusable-components.html
        checkPropType = function (values, prop, displayName) {

          var value = values[prop];
          var validationResult = t.validate(value, propType);

          if (!validationResult.isValid()) {

            var message = getMessage(validationResult.errors, 'prop ' + t.stringify(prop), displayName, propType);

            // add a readable entry in the call stack
            // when "Pause on exceptions" and "Pause on Caught Exceptions"
            // are enabled in Chrome DevTools
            checkPropType.displayName = message;

            t.fail(message);
          }
        };
      } else {
        checkPropType = function () {};
      }

      // attach the original tcomb definition, so other components can read it
      // via `propTypes.whatever.tcomb`
      checkPropType.tcomb = propType;

      propTypes[k] = checkPropType;
    });

    if (process.env.NODE_ENV !== 'production') {
      options = options || {};
      // allows to opt-out additional props check
      if (options.strict !== false) {
        propTypes.__strict__ = function (values, prop, displayName) {
          var extra = [];
          for (var k in values) {
            // __strict__ and __subtype__ keys are excluded in order to support the React context feature
            if (k !== '__strict__' && k !== '__subtype__' && values.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
              extra.push(k);
            }
          }
          if (extra.length > 0) {
            t.fail('Invalid additional prop(s):\n\n' + t.stringify(extra) + '\n\nsupplied to ' + displayName + '.');
          }
        };
      }
    }

  }
  else {
    if (process.env.NODE_ENV !== 'production') {
      propTypes.__generictype__ = function (values, prop, displayName) {
        var validationResult = t.validate(values, innerType);
        if (!validationResult.isValid()) {
          t.fail(getMessage(validationResult.errors, 'props', displayName, innerType));
        }
      };
    }
  }

  if (isSubtype) {
    if (process.env.NODE_ENV !== 'production') {
      propTypes.__subtype__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          t.fail('Invalid props:\n\n' + t.stringify(values) + '\n\nsupplied to ' + displayName + ', should be a ' + t.getTypeName(type) + ' subtype.');
        }
      };
    } else {
      propTypes.__subtype__ = function () {};
    }

    // attach the original predicate, so other components can read it
    // via `propTypes.__subtype__.predicate`
    propTypes.__subtype__.predicate = type.meta.predicate;
  }

  return propTypes;
}

//
// ES7 decorator
//

function es7PropsDecorator(type, options) {
  return function (Component) {
    Component.propTypes = getPropTypes(type, options);
  };
}

//
// Built-in types
//

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x) || t.list(ReactNode).is(x);
});
var ReactChild = t.irreducible('ReactChild', function(x) {
  return ReactNode.is(x) || t.Bool.is(x) || t.Nil.is(x);
});
var ReactChildren = t.irreducible('ReactChildren', function(x) {
  return ReactChild.is(x) || t.list(ReactChildren).is(x);
});

t.ReactElement = ReactElement; // deprecated
t.ReactNode = ReactNode; // deprecated
t.ReactChild = ReactChild; // deprecated
t.ReactChildren = ReactChildren; // deprecated

module.exports = {
  t: t, // deprecated
  propTypes: getPropTypes,
  props: es7PropsDecorator,
  ReactElement: ReactElement,
  ReactNode: ReactNode,
  ReactChild: ReactChild,
  ReactChildren: ReactChildren,
  ReactElementT: ReactElement,
  ReactNodeT: ReactNode,
  ReactChildT: ReactChild,
  ReactChildrenT: ReactChildren
};
