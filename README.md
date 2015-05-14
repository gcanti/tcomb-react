# Features

- **additional fine grained type checks**, nestable at arbitrary level
- optionally when a validation fails, **the debugger kicks in** so you can inspect the stack and quickly find out what's wrong
- by default props are required, a **saner default** since it's quite easy to forget `.isRequired`
- splitting props types and components allows runtime type introspection and code reuse

# API

`toPropTypes(type, [options])`

- `type`: a tcomb type 
- `options`: see Debugging section

# Example

## createClass (ES5)

```js
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

## React.Component (ES6)

```js
const t = require('tcomb-react');

const AlertType = t.enums.of('info success danger warning');

const AlertProps = t.struct({
  type: AlertType,
  children: t.react.ReactNode
});

class Alert extends React.Component {

  render() {
    return (
      <div
      className={'alert alert-' + this.props.type}>
      {this.props.children}
      </div>
    );
  }

}

Alert.propTypes = t.react.toPropTypes(AlertProps);
```

# Debugging

If you want to throw an exception instead of a message in the console, pass a `debug: true` option:

```js
Alert.propTypes = t.react.toPropTypes(AlertProps, {debug: true});
```


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
