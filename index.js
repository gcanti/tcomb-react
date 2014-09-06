'use strict';

var t = require('tcomb');
var React = require('react');
var ReactDescriptor = require('react/lib/ReactDescriptor');

var assert = t.assert;
var isType = t.util.isType;

//
// utils
//

var TYPE = '_tag';
var isComponent = ReactDescriptor.isValidDescriptor;

// returns the displayName of a component
function getDisplayName(x) {
  var ctor = isComponent(x) ? x.constructor :     // Component
    isComponent(x._descriptor) ? x._descriptor :  // ReactCompositeComponent
    x;                                            // ReactDescriptor
  return ctor.type ? ctor.type.displayName : null;
}

// given a type, extracts the struct within
function unpackStruct(type) {
  var kind = t.util.getKind(type);
  if (kind === 'struct') {
    return type;
  }
  assert(kind === 'subtype', 'only structs and subtypes of structs are allowed');
  return unpackStruct(type.meta.type);
}

function unpack(x, omitType) {
  if (t.Arr.is(x)) {
    return x.map(unpack);
  }
  if (t.Obj.is(x)) {
    var ret = {};
    var props = x.props || x;
    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        ret[k] = unpack(props[k]);
      }
    }
    if (x.props) {
      ret[TYPE] = getDisplayName(x);
    }
    return ret;
  }
  return x;
}

//
// asserts
//

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

function check(actualProps, type, opts, checkTag) {
  opts = opts || {};
  opts.strict = t.Bool.is(opts.strict) ? opts.strict : true; 
  var innerStruct = unpackStruct(type);
  if (opts.strict) {
    assertLeq(actualProps, innerStruct);
  }
  if (checkTag) {
    assert(isType(innerStruct.meta.props[TYPE]), 'Invalid inner struct, it must have a `%s` prop.', TYPE);
  }
  return type(actualProps);
}

function assertEqual(props, type, opts) {
  return check(unpack(props), type, opts);
}

//
// DOM types
//

var DOM = {};
Object.keys(React.DOM).forEach(function (tagName) {
  var name = tagName.substring(0, 1).toUpperCase() + tagName.substring(1);
  DOM[name] = t.enums.of(tagName);
});

//
// bind
// 

function bind(component, type, opts) {
  
  assert(t.Func.is(component), 'Invalid argument `component` of value `%j` supplied to `bind()`, expected a component.', component);
  assert(isType(type), 'Invalid argument `type` of value `%j` supplied to `bind()`, expected a type.', type);

  var displayName = getDisplayName(component);
  assert(t.Str.is(displayName), 'Invalid argument `component` of name `%s` supplied to `bind()`, the component must have a displayName.', displayName);

  function Component(props) {
    
    // if there are no attributes React send null instead of {}
    var value = props ? t.util.mixin({}, props) : {};
    
    var len = arguments.length;
    // real props are in 0 position
    if (len === 2) {
      // if there is only a child, avoid an array
      value.children = arguments[1];
    } else if (len > 2) {
      value.children = Array.prototype.slice.call(arguments, 1);
    }
    value.children = unpack(value.children);
    value[TYPE] = displayName;

    // check
    check(value, type, opts, true);
    
    // delegate rendering to the orginal component
    return component.apply(component, arguments);
  }

  // attach a reference
  Component.component = component;
  Component.type = type;

  return Component;
}

t.react = {
  DOM: DOM,
  assertEqual: assertEqual,
  bind: bind
};

module.exports = t;