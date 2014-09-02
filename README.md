% tcomb-react

Control your React components like a boss

# Example

Let's build a React component that render a link that point to a certain part of a document, the component must handle:

- a `href` prop and it must be a string starting with `#`
- only one child and it must be a string

```js
var Tcomb = require('tcomb-react');
var Str = Tcomb.Str;
var subtype = Tcomb.subtype;
var struct = Tcomb.struct;

var Href = subtype(Str, function (s) {
  return s.substring(0, 1) === '#';
}, 'Href');

var Props = struct({
  href: Href,
  children: Str
}, 'Anchor');

var Anchor = React.createClass({
  render: function () {
    Tcomb.react.assertEqual(this, Props);
    return (
      <a href={this.props.href}>{this.props.children}</a>
    );
  }
});

// OK
React.renderComponent(
  <Anchor href="#section">title</Anchor>
, mountNode);

// KO, href is missing, debugger kicks in and then throws 'Invalid type argument `value` of value `undefined` supplied to `Str`, expected a `Str`.'
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);

// KO, text is missing, debugger kicks in and then throws 'Invalid type argument `value` of value `undefined` supplied to `Str`, expected a `Str`.'
React.renderComponent(
  <Anchor href="#section"></Anchor>
, mountNode);

// KO, href is wrong, debugger kicks in and then throws 'Invalid type argument `value` of value `"http://mydomain.com"` supplied to `Href`, expected a valid value for the predicate.'
React.renderComponent(
  <Anchor href="http://mydomain.com">title</Anchor>
, mountNode);

// KO, content is wrong, debugger kicks in and then throws 'Invalid type argument `value` of value `{"children":"title","__type__":"span"}` supplied to `Str`, expected a `Str`.'
React.renderComponent(
  <Anchor href="#section"><span>title</span></Anchor>
, mountNode);
```

# Api

```js
assertEqual(component, type, [opts])
```