'use strict';

var t = require('tcomb-validation');
var React = require('react');
var ReactDescriptor = require('react/lib/ReactDescriptor');
var isRenderable = require('./isRenderable');

var assert = t.assert;
var Type = t.Type;

//
// utils
//

var TYPE = '__tag__';

// returns the displayName of a factory or a component
function getDisplayName(x) {
  return x.type.displayName;
}

// given the arguments of a call to a React factory,
// returns an object containing props and children
// mantaining the original arguments untouched
function objectify(args) {
  // if there are no attributes jsx send null
  var ret = args[0] ? t.util.mixin({}, args[0]) : {};
  var len = args.length;
  // apply the same logic of React: if there is only one
  // child, avoid the array
  if (len === 2) {
    ret.children = getProps(args[1]);
  } else if (len > 2) {
    ret.children = getProps(Array.prototype.slice.call(args, 1));
  }
  return ret;
}

// given a component, extracts all props recursively
// and add a special prop containing the tag name
// to trace the origin
function getProps(x) {
  if (t.Arr.is(x)) {
    return x.map(getProps);
  }
  if (t.Obj.is(x)) {
    var ret = {};
    if (x.props) {
      ret[TYPE] = getDisplayName(x);
    }
    var props = x.props || x;
    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        ret[k] = getProps(props[k]);
      }
    }
    return ret;
  }
  return x;
}

// given a type, extracts the struct within
function getStruct(type) {
  var kind = t.util.getKind(type);
  if (kind === 'struct') {
    return type;
  }
  assert(kind === 'subtype', 'Invalid type: only structs and subtypes of structs are allowed');
  return getStruct(type.meta.type);
}

//
// assertEqual
//

function assertLeq(props, type) {
  var expectedProps = getStruct(type).meta.props;
  for (var k in props) {
    if (props.hasOwnProperty(k)) {
      if (!expectedProps.hasOwnProperty(k)) {
        t.fail(t.util.format('type `%s` does not handle property `%s`', t.util.getName(type), k));
      }
    }
  }
}

function check(props, type, opts) {
  opts = opts || {};
  if (opts.strict) {
    assertLeq(props, type);
  }
  return type(props);
}

function assertEqual(props, type, opts) {
  assert(t.Obj.is(props), 'Invalid argument `props` of value `%j` supplied to `assertEqual`, expected and `Obj`', props);
  assert(Type.is(type), 'Invalid argument `type` of value `%j` supplied to `assertEqual`, expected a type', type);
  return check(getProps(props), type, opts);
}

//
// bind
// 

function bind(factory, type, opts) {
  assert(ReactDescriptor.isValidFactory(factory), 'Invalid argument `factory` of value `%j` supplied to `bind()`, expected a factory.', factory);
  assert(Type.is(type), 'Invalid argument `type` of value `%j` supplied to `bind()`, expected a type.', type);

  var displayName = getDisplayName(factory);
  assert(t.Str.is(displayName), 'Invalid argument `factory` of name `%s` supplied to `bind()`, the factory must have a displayName.', displayName);

  function proxy() {
    var props = objectify(arguments);
    props[TYPE] = displayName;
    check(props, type, opts);
    // delegate rendering to the orginal factory
    return factory.apply(factory, arguments);
  }

  // pretend to be a real React factory
  proxy.prototype = new ReactDescriptor();

  // attach references
  proxy.factory = factory;
  proxy.type = type;

  return proxy;
}

//
// React types
//

// represents an instance of a React factory
var Component = t.irriducible('Component', ReactDescriptor.isValidDescriptor);

var Key = t.union([t.Str, t.Num], 'Key');

var Mountable = t.irriducible('Mountable', function (x) {
  return typeof x === 'object' &&  typeof x.getDOMNode === 'function' && x.nodeType === 1;
});

var Ref = t.Str;

var Renderable = t.irriducible('Renderable', isRenderable);

// for all tags in React.DOM build a corresponding type
var DOM = {};
Object.keys(React.DOM).forEach(function (tagName) {
  var name = tagName.substring(0, 1).toUpperCase() + tagName.substring(1);
  var props = {};
  props[TYPE] = t.enums.of(tagName, name)
  DOM[name] = t.struct(props, name);
});

t.react = {
  getDisplayName: getDisplayName,
  objectify: objectify,
  assertEqual: assertEqual,
  bind: bind,
  Component: Component,
  Key: Key,
  Mountable: Mountable,
  Ref: Ref,
  Renderable: Renderable,
  DOM: DOM
};

module.exports = t;