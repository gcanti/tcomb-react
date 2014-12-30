# Features

- **additional fine grained type checks**, nestable at arbitrary level
- optionally when a validation fails, **the debugger kicks in** so you can inspect the stack and quickly find out what's wrong
- by default props are required, a **saner default** since it's quite easy to forget `.isRequired`
- splitting props types and components allows component reflection and code reuse
- easily integrable with [tcomb-form](https://gcanti.github.io/tcomb-form) to **build awesome demos** of your components

# Example

```js
// Alert.jsx file

var t = require('tcomb-react');

var AlertType = t.enums.of('info success danger warning');

var AlertProps = t.struct({
  type: AlertType,
  children: t.react.ReactNode
});

var Alert = React.createClass({

  propTypes: t.react.toPropTypes(AlertProps),

  render: function () {
    return (
      <div
      className={'alert alert-' + this.props.type}>
      {this.props.children}
      </div>
    );
  }

});
```

# Build a component playground

Building a playground for the `Alert` component is simple as writing:

```js
var Playground = require('tcomb-react/Playground.jsx');

React.render(
  <Playground
    component={Alert}
    props={AlertProps} />,
  document.getElementById('app')
);
```

See the demo live [here](https://gcanti.github.io/tcomb-react/docs/demo/alert/index.html).

# Comparison table

| Type | React | tcomb-react |
|------|-------|-------------|
| array | array | Arr |
| boolean | bool | Bool |
| functions | func | Func |
| numbers | number | Num |
| objects | object | Obj |
| strings | string | Str |
| all | any | Any |
| regular expressions | ✘ | Re |
| dates | ✘ | Dat |
| errors | ✘ | Err |
| required prop | T.isRequired | T |
| optional prop | T | maybe(T) |
| custom types | ✘ | ✓ |
| tuples | ✘ | tuple([T, U, ...]) |
| lists | arrayOf(T) | list(T) |
| instance | instanceOf(A) | T |
| dictionaries | objectOf(T) | dict(T, U) (keys are checked) |
| enums | oneOf(['a', 'b']) | enums.of('a b') |
| unions | oneOfType([T, U]) | union([T, U]) |
| duck typing | shape | struct |
| elements | element | ReactElement |
| nodes | node | ReactNode |
