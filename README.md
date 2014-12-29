tcomb-react provides a compact alternative syntax for React's propTypes, makes easy to debug your components and allows runtime reflection of components props.

# Example

```js
var React = require('react');
var t = require('tcomb-react');

var AlertType = t.enums.of('info success danger warning');

var Alert = t.struct({
  type: AlertType,
  content: t.react.ReactNode
});

var AlertComponent = React.createClass({

  propTypes: t.react.toPropTypes(Alert),

  render: function () {
    return (
      <div
      className={'alert alert-' + this.props.type}>
      {this.props.content}
      </div>
    );
  }

});
```

# Features

- by default props are required, a **saner default** since it's quite easy to forget `.isRequired`
- optionally when a validation fails, **the debugger kicks in** so you can inspect the stack and quickly find out what's wrong
- additional fine grained type checks, nestable at arbitrary levels
- component runtime reflection
- all defined types can be reused as domain models
- easily integrable with [tcomb-form](https://gcanti.github.io/tcomb-form) to build awesome demos of your components

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
