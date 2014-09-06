% tcomb-react

This library allows you to check the props of a React component (the children too).

# Use cases

- [Prototyping](prototyping)
- [Safe components](safe-components)

# Prototyping

To add a throwaway type checking while prototyping, add some raw asserts to your `render` methods.

```js
assertEqual(props, type, [opts])
```
- `props` component props
- `type` a `struct` or a `subtype` of a `struct`
- `opts` see [Options](options)

If you pass a wrog prop to the component **the debugger kicks in** so you can inspect the stack and quickly find out what's wrong, then it throws an error with a descriptive message.

## Example

Let's build a simple React component with a fancy spec, the component must have:

- only a `href` prop and it must be a string starting with `#`
- only one child and it must be a string

```js
var t = require('tcomb-react');
var Str = t.Str;          // the string type
var subtype = t.subtype;  // build a subtype
var struct = t.struct;    // build a struct (i.e. a class)

// a predicate is a function with signature (x) -> boolean
var predicate = function (s) { return s.substring(0, 1) === '#'; };

// the `href` spec
var Href = subtype(Str, predicate);

// the props spec
var AnchorProps = struct({
  href: Href,
  children: Str
});

var Anchor = React.createClass({
  render: function () {
    // add this assert and you are done
    t.react.assertEqual(this.props, AnchorProps);
    return (
      <a href={this.props.href}>{this.props.children}</a>
    );
  }
});
```

here some results

```js
// OK
React.renderComponent(
  <Anchor href="#section">title</Anchor>
, mountNode);

// KO, `unknown` attribute not specified
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

## Options

### opts.strict

If set to `false`, allows unspecified properties (default `true`).

```js
t.react.assertEqual(this.props, Props, {strict: false});

...

// OK
React.renderComponent(
  <Anchor href="#section" unknown="true">title</Anchor>
, mountNode);
```

*To find out all the controls and the types you can define see [here](https://github.com/gcanti/tcomb).*

# Safe components

For third party components or if you want a more fine-grained control you can `bind` your component to a type. 
The function `bind` returns a proxy component with the same interface of the original but with asserts included.
In production you can choose to switch from the proxy component to the original one.

```js
bind(component, type, opts)
```

- `component` a React component descriptor
- `type` a `struct` or a `subtype` of a `struct`
- `opts` see [Options](options)

## Workflow

### 1. Define your component as usual

```js
// unsafe-component.js
var Anchor = React.createClass({
  render: function () {
    return (
      <a href={this.props.href}>{this.props.children}</a>
    );
  }
});

module.exports = Anchor;
```

### 2. Define the type of the props

```js
// safe-component.js
var AnchorProps = struct({
  _tag: enums.of('Alert'), // this must match the component displayName
  href: Href,
  children: Str
});

var Anchor = require('unsafe-component.js');

module.exports = t.react.bind(Anchor, AnchorProps);
```

### 3. Use the proxy safely

```js
// app.js

var Anchor = require('safe-component.js')

// KO, href is missing
React.renderComponent(
  <Anchor>title</Anchor>
, mountNode);
```

You can find more examples on `bind` in the [tcomb-react-bootstrap](https://github.com/gcanti/tcomb-react-bootstrap) project.

# Tags

For each `HTML` tag, there is a ready type in the `DOM` namespace.
Say you want modify the above example to accept only a `span` child:

```js
var Props = struct({
  href: Href,
  children: t.react.DOM.Span
});

// OK
React.renderComponent(
  <Anchor href="#section"><span>title</span></Anchor>
, mountNode);

// KO
React.renderComponent(
  <Anchor href="#section">title</Anchor>
, mountNode);
```
