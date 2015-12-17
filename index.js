'use strict';

var React = require('react');
var t = require('tcomb-validation');

//
// helpers
//

// use t.stringify if defined, otherwise fallback to a verbose but possibly slow implementation
var stringify = t.stringify || function stringify(x) {
  try { // handle "Converting circular structure to JSON" error
    return JSON.stringify(x);
  }
  catch (e) {
    return String(x);
  }
};

// returns true id type is a struct
function isStruct(type) {
  return ( type.meta.kind === 'struct' );
}

// returns true id type is a subtype
function isSubtype(type) {
  return ( type.meta.kind === 'subtype' );
}

//
// main function
//

function getPropTypes(type, options) {

  //
  // let's type check the input...
  //

  // getPropTypes can also accept a dictionary prop -> type
  if (t.Obj.is(type)) {
    type = t.struct(type);
  }

  // here type should be a struct or a subtype of a struct
  if (process.env.NODE_ENV !== 'production') {
    t.assert(
      t.isType(type) && ( isStruct(type) || ( isSubtype(type) && isStruct(type.meta.type) ) ),
      '[tcomb-react] Invalid argument type supplied to propTypes(), must be a struct, a subtype of a struct or a dictionary prop -> type'
    );
  }

  var propTypes = {};
  var subtype = isSubtype(type);
  var innerStruct = subtype ? type.meta.type : type;
  var props = innerStruct.meta.props;

  Object.keys(props).forEach(function (k) {

    var propType = props[k];
    var propTypeName = t.getTypeName(propType);
    var checkPropType = function () {};

    if (process.env.NODE_ENV !== 'production') {

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html
      checkPropType = function (values, prop, displayName) {

        var value = values[prop];
        var validationResult = t.validate(value, props[prop]);

        if (!validationResult.isValid()) {

          var message = [
            'Invalid prop ' + stringify(prop) + ' supplied to ' + displayName + ', should be a ' + propTypeName + '.\n',
            'Detected errors (' + validationResult.errors.length + '):\n'
          ].concat(validationResult.errors.map(function (e, i) {
            return ' ' + (i + 1) + '. ' + e.message;
          })).join('\n') + '\n\n';

          // add a readable entry in the call stack
          // when "Pause on exceptions" and "Pause on Caught Exceptions"
          // are enabled in Chrome DevTools
          checkPropType.displayName = message;

          t.fail(message);
        }
      };
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
          t.fail('Invalid additional prop(s):\n\n' + stringify(extra) + '\n\nsupplied to ' + displayName + '.');
        }
      };
    }

    if (subtype) {
      propTypes.__subtype__ = function (values, prop, displayName) {
        if (!type.meta.predicate(values)) {
          t.fail('Invalid props:\n\n' + stringify(values) + '\n\nsupplied to ' + displayName + ', should be a ' + t.getTypeName(type) + ' subtype.');
        }
      };
    }
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

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x) || t.list(ReactNode).is(x);
});
var ReactChild = t.irreducible('ReactChild', function(x) {
  return ReactNode.is(x) || t.Bool.is(x) || t.Nil.is(x);
});
var ReactChildren = t.irreducible('ReactChildren', function(x) {
  return ReactChild.is(x) || t.list(ReactChild).is(x);
});

t.ReactElement = ReactElement;
t.ReactNode = ReactNode;
t.ReactChild = ReactChild;
t.ReactChildren = ReactChildren;

module.exports = {
  t: t,
  propTypes: getPropTypes,
  props: es7PropsDecorator,
  ReactElement: ReactElement, // deprecated
  ReactNode: ReactNode  // deprecated
};
