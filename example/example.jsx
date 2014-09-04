/** @jsx React.DOM */

'use strict';

var t = require('../index');
var React = require('react');
var UnsafeAlert = require('react-bootstrap/Alert');
var bs = require('react-bootstrap');

var Any = t.Any;
var Nil = t.Nil;
var Str = t.Str;
var Num = t.Num;
var Func = t.Func;
var subtype = t.subtype;
var struct = t.struct;
var enums = t.enums;
var maybe = t.maybe;

var mountNode = document.getElementById('app');

// a subtype is defined by a type and a predicate
// a predicate is a function with signature (x) -> boolean
var Href = subtype(Str, function (s) {
  return s.substring(0, 1) === '#';
}, 'Href'); // add a name for better debugging

// this is how you can define the props of the component
var Props = struct({
  href: Href,
  children: Str
}, 'Anchor'); // add a name for better debugging

var Anchor = React.createClass({
  render: function () {
    // add this assert and you have done
    t.react.assertEqual(this, Props);
    return (
      <a href={this.props.href}>{this.props.children}</a>
    );
  }
});

// OK
React.renderComponent(
  <Anchor href="#section">title</Anchor>
, mountNode);

/*
// KO, href is missing, debugger kicks in
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);

// KO, text is missing, debugger kicks in
React.renderComponent(
  <Anchor href="#section"></Anchor>
, mountNode);

// KO, href is wrong, debugger kicks in
React.renderComponent(
  <Anchor href="http://mydomain.com">title</Anchor>
, mountNode);

// KO, content is wrong, debugger kicks in
React.renderComponent(
  <Anchor href="#section"><span>title</span></Anchor>
, mountNode);

// KO, unknown attribute not specified
React.renderComponent(
  <Anchor href="#section" unknown="true">title</Anchor>
, mountNode);
*/

//
// bind example
// 
var BsStyle = enums.of('info success warning danger', 'BsStyle');
var BsSize = enums.of('large medium small xsmall', 'BsSize');

// onDismiss and dismissAfter must either or neither passed
var eitherOrNeither = function (x) {
  return Nil.is(x.onDismiss) === Nil.is(x.dismissAfter);
};

var AlertProps = subtype(struct({
  __type__: enums.of('Alert'), // ugly
  bsStyle: maybe(BsStyle),
  bsSize: maybe(BsSize),
  onDismiss: maybe(Func),
  dismissAfter: maybe(Num),
  children: Any
}), eitherOrNeither, 'Alert');

var Alert = t.react.bind(UnsafeAlert, AlertProps);

React.renderComponent(
  <Alert bsStyle="warning">hey</Alert>
, mountNode);

