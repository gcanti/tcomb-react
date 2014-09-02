'use strict';

var t = require('tcomb');
var React = require('react');
var ReactDescriptor = require('react/lib/ReactDescriptor');

var Obj = t.Obj;
var assert = t.assert;
var struct = t.struct;
var isType = t.util.isType;

//
// utils
//

var TYPE = '__type__';
var isComponent = ReactDescriptor.isValidDescriptor;

// returns the displayName of a component
function getDisplayName(x) {
  var ctor = isComponent(x) ? x.constructor :     // Component
    isComponent(x._descriptor) ? x._descriptor :  // ReactCompositeComponent
    x;                                            // ReactDescriptor
  return ctor.type ? ctor.type.displayName : null;
}

//
// asserts
//

function extractProps(x, omitType) {
  if (t.Arr.is(x)) {
    return x.map(extractProps);
  }
  if (Obj.is(x)) {
    var ret = {};
    for (var k in x.props) {
      if (x.props.hasOwnProperty(k)) {
        ret[k] = extractProps(x.props[k]);
      }
    }
    if (!omitType) {
      ret[TYPE] = getDisplayName(x);
    }
    return ret;
  }
  return x;
}

function assertLeq(actualProps, type) {
  var expectedProps = type.meta.props;
  for (var k in actualProps) {
    if (actualProps.hasOwnProperty(k)) {
      if (!expectedProps.hasOwnProperty(k)) {
        t.fail(t.util.format('type `%s` does not handle property `%s`', t.util.getName(type), k));
      }
    }
  }
}

function assertEqual(component, type, opts) {
  opts = opts || {};
  opts.strict = t.Bool.is(opts.strict) ? opts.strict : true; 
  var actualProps = extractProps(component, true);
  if (opts.strict) {
    assertLeq(actualProps, type);
  }
  return new type(actualProps);
}

//
// DOM types
//

var DOM = {};
Object.keys(React.DOM).forEach(function (tagName) {
  var name = tagName.substring(0, 1).toUpperCase() + tagName.substring(1);
  DOM[name] = t.subtype(t.Any, function (x) {
    return x[TYPE] === tagName;
  }, name);
});

t.react = {
  assertEqual: assertEqual,
  DOM: DOM
};

module.exports = t;