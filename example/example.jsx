/** @jsx React.DOM */

'use strict';

var t = require('../index');
var React = require('react');

var Str = t.Str;
var subtype = t.subtype;
var struct = t.struct;

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

var mountNode = document.getElementById('app');

// OK
React.renderComponent(
  <Anchor href="#section">title</Anchor>
, mountNode);

// KO, href is missing, debugger kicks in
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);

// decomment below to see the other errors

/*
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