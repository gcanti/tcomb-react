'use strict';

var t = require('tcomb-validation');

function getPropTypes(spec) {

  var propTypes = {};
  // FIXME type must be a struct
  var props = spec.meta.props;

  Object.keys(props).forEach(function (k) {

    // React custom prop validators
    // see http://facebook.github.io/react/docs/reusable-components.html

    propTypes[k] = function (values, name, displayName) {
      var type = props[name];
      var value = values[name];
      var err = t.validate(value, type).firstError();
      if (err) {
        return new Error(t.util.format('Invalid prop `%s` = `%s` supplied to `%s`, should be a `%s`', name, value, displayName, t.util.getName(type)));
      }
    };

  });

  return propTypes;
}

function Mixin(spec, opts) {

  opts = opts || {};
  var name = opts.name || Mixin.defaultName || 'TcombPropTypes';

  if (t.Obj.is(spec)) {
    spec = t.struct(spec, name);
  }

  var ret = {
    propTypes: getPropTypes(spec),
    statics: {}
  };

  // attach the struct to component constructor as a static property
  ret.statics[name] = spec;

  return ret;
}

module.exports = {
  Mixin: Mixin,
  getPropTypes: getPropTypes
};