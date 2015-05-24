# Features

- **additional fine grained type checks**, nestable at arbitrary level
- by default props are required, a **saner default** since it's quite easy to forget `.isRequired`
- splitting props types and components allows runtime type introspection and code reuse

# ES7 decorator

```js
import t from 'tcomb';
import { props } from 'tcomb-react';

const AlertType = t.enums.of('info success danger warning');

@props({
  type: AlertType
})
class Alert {

  render() {
    return (
      <div className={'alert alert-' + this.props.type}>
        {this.props.children}
      </div>
    );
  }

}
```

# ES5

```js
var t = require('tcomb');
var propTypes = require('tcomb-react').propTypes;

var AlertType = t.enums.of('info success danger warning');

var Alert = React.createClass({

  propTypes: propTypes({
    type: AlertType
  }),

  render: function () {
    return (
      <div className={'alert alert-' + this.props.type}>
        {this.props.children}
      </div>
    );
  }

});
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
