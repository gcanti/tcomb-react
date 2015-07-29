# Features

- builds on [tcomb](https://github.com/gcanti/tcomb) library
- additional fine grained type checks, nestable at arbitrary level
- **by default props are required**, a saner default since it's quite easy to forget `.isRequired`
- **checks for unwanted additional props**

# ES7 decorator

```js
import { props, t } from 'tcomb-react';

const Gender = t.enums.of(['Male', 'Female']);
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

**Note**. `@props` can accepts a subtype of a struct (see [The subtype combinator](https://github.com/gcanti/tcomb/blob/master/GUIDE.md#the-subtype-combinator)).

```js
@props(t.subtype(t.struct({
  name: t.Str,
  ...
}), () => { ... }))
```

## Unwanted additional props

By default tcomb-react checks unwanted additional props:

```js
@props({
  name: t.Str
})
class Person extends React.Component {

  render() {
    return (
      <div>
        <p>{this.props.name}</p>
      </div>
    );
  }

}

...

<Person name="Giulio" surname="Canti" />
```

ouput to console:

```
Warning: Failed propType: [tcomb] Invalid additional prop(s):

[
  "surname"
]

supplied to Person.
```

You can **opt-out** passing an additional argument `{ strict: false }`:

```js
@props({
  name: t.Str
}, { strict: false })
class Person extends React.Component {

  render() {
    return (
      <div>
        <p>{this.props.name}</p>
      </div>
    );
  }

}
```

# ES5

```js
var t = require('tcomb-react').t;
var propTypes = require('tcomb-react').propTypes;

var Gender = t.enums.of(['Male', 'Female']);
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

# Augmented pre-defined types

- `t.ReactElement`
- `t.ReactNode`

```js
import { props, t } from 'tcomb-react';

@props({
  children: t.ReactElement // allow only one child
})
class MyComponent extends React.Component {

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }

}
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
| react element | element | ReactElement |
| react node | node | ReactNode |
