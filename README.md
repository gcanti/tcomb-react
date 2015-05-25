# Features

- **additional fine grained type checks**, nestable at arbitrary level
- by default props are required, a **saner default** since it's quite easy to forget `.isRequired`
- splitting props types and components allows runtime type introspection and code reuse

# ES7 decorator

```js
import t from 'tcomb';
import { props } from 'tcomb-react';

const Gender = t.enums.of('Male Female');
const URL = t.subtype(t.Str, s => s.startsWith('http'));

@props({
  name: t.Str,
  surname: t.maybe(t.Str),
  age: t.Num,
  gender: Gender,
  avatar: URL
})
class Card extends React.Component {

  render() {
    return (
      <div>
        <p>{this.props.name}</p>
        ...
      </div>
    );
  }

}
```

# ES5

```js
var t = require('tcomb');
var propTypes = require('tcomb-react').propTypes;

var Gender = t.enums.of('Male Female');
var URL = t.subtype(t.Str, function (s) { return s.startsWith('http'); });

var Card = React.createClass({

  propTypes: propTypes({
    name: t.Str,
    surname: t.maybe(t.Str),
    age: t.Num,
    gender: Gender,
    avatar: URL
  }),

  render: function () {
    return (
      <div>
        <p>{this.props.name}</p>
        ...
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
