% tcomb-react

This library allows you to check all the props of your React components (yes also the children). If you pass a wrong
prop to the component, **the debugger kicks in** so you can inspect the stack and quickly find out what's wrong, then it
throws an error with **descriptive message**.

# Example please!

Let's build a simple React component rendering an internal link, the component must have:

- only a `href` prop and it must be a string starting with `#`
- only one child and it must be a string

here we go

```js
var Tcomb = require('tcomb-react');
var Str = Tcomb.Str;          // the string type
var subtype = Tcomb.subtype;  // build a subtype
var struct = Tcomb.struct;    // build a struct (i.e. a class)

// a subtype is defined by a type and a predicate
// a predicate is a function with signature (x) -> boolean
var Href = subtype(Str, function (s) {
  return s.substring(0, 1) === '#';
}, 'Href');

// this is how you can define the props of the component
var Props = struct({
  href: Href,
  children: Str
}, 'Anchor');

var Anchor = React.createClass({
  render: function () {
    // add this assert and you have done
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

// KO, unknown attribute not specified
React.renderComponent(
  <Anchor href="#section" unknown="true">title</Anchor>
, mountNode);

// KO, href is missing
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);

// KO, content is missing
React.renderComponent(
  <Anchor href="#section"></Anchor>
, mountNode);

// KO, href is wrong
React.renderComponent(
  <Anchor href="http://mydomain.com">title</Anchor>
, mountNode);

// KO, content should be a string not a span
React.renderComponent(
  <Anchor href="#section"><span>title</span></Anchor>
, mountNode);
```

# Api

## Asserts

```js
assertEqual(component, type, [opts])
```

Throws an error if you pass a wrong prop to the component.

### options.strict

If set to `false`, allows unspecified properties (default `true`).

```js
// OK
React.renderComponent(
  <Anchor href="#section" unknown="true">title</Anchor>
, mountNode);
```