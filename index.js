'use strict';

var React = require('react');
var t = require('tcomb-validation');

var ReactElement = t.irreducible('ReactElement', React.isValidElement);

function getPropTypes(spec) {

  var propTypes = {};
  var props = spec.meta.props;

  Object.keys(props).forEach(function (k) {

    // React custom prop validators
    // see http://facebook.github.io/react/docs/reusable-components.html

    propTypes[k] = function (values, name, displayName) {
      var type = props[name];
      var value = values[name];
      var err = t.validate(value, type).firstError();
      if (err) {
        return new Error(t.util.format('Invalid prop `%s` = `%s` supplied to `%s`, should be `%s`', name, value, displayName, t.util.getName(type)));
      }
    };

  });

  return propTypes;
}

function Mixin(spec) {

  if (t.Obj.is(spec)) {
    spec = t.struct(spec);
  }

  return {
    propTypes: getPropTypes(spec),
    statics: {
      // attach the struct to component constructor as a static property
      TcombPropTypes: spec
    }
  };
}

t.react = {
  getPropTypes: getPropTypes,
  Mixin: Mixin,
  ReactElement: ReactElement
};

module.exports = t;