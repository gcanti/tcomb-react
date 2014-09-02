'use strict';

var t = require('tcomb');
var React = require('react');
var ReactDescriptor = require('react/lib/ReactDescriptor');
var isRenderable = require('./isRenderable');
var validate = require('tcomb-validation').addons.validation.validate;

var Any = t.Any;
var Nil = t.Nil;
var Str = t.Str;
var Num = t.Num;
var Arr = t.Arr;
var subtype = t.subtype;
var union = t.union;
var assert = t.assert;

//
// React types
//

// represents an instance of a Component
var Component = subtype(Any, ReactDescriptor.isValidDescriptor, 'Component');
var ComponentClass = subtype(Any, React.isValidClass, 'ComponentClass');
var Ref = Str;
var Renderable = subtype(Any, isRenderable, 'Renderable');
var Child = union([Str, Component], 'Child');
var ChildOrChildren = union([Child, t.list(Child)], 'ChildOrChildren');
var Children = t.maybe(ChildOrChildren, 'Children');
var Key = t.union([Str, Num], 'Key');

function toPropTypes(Struct) {
  
  var propTypes = {};
  var props = Struct.meta.props;
  
  Object.keys(props).forEach(function (k) {
    // React custom prop validator
    // see http://facebook.github.io/react/docs/reusable-components.html
    propTypes[k] = function (values, name, component) {
      var opts = {
        path: ['this.props.' + name], 
        messages: ':path of value `:actual` supplied to `' + component + '`, expected a `:expected`'
      };
      return validate(values[name], props[name], opts).firstError();
    }
  });

  return propTypes;
}

module.exports = {
  Children: Children,
  Component: Component,
  ComponentClass: ComponentClass,
  Key: Key,
  Ref: Ref,
  Renderable: Renderable,
  toPropTypes: toPropTypes
};