/** @jsx React.DOM */

'use strict';

var t = require('../index');
var React = require('react');

var Str = t.Str;
var subtype = t.subtype;
var struct = t.struct;

var Href = subtype(Str, function (s) {
  return s.substring(0, 1) === '#';
}, 'Href');

var Props = struct({
  href: Href,
  children: Str
}, 'Anchor');

var Anchor = React.createClass({
  render: function () {
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

/*
// KO, href is missing, debugger kicks in
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);
*/

/*
// KO, text is missing, debugger kicks in
React.renderComponent(
  <Anchor href="#section"></Anchor>
, mountNode);
*/

/*
// KO, href is wrong, debugger kicks in
React.renderComponent(
  <Anchor href="http://mydomain.com">title</Anchor>
, mountNode);
*/

/*
// KO, content is wrong, debugger kicks in
React.renderComponent(
  <Anchor href="#section"><span>title</span></Anchor>
, mountNode);
*/
