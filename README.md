[![build status](https://img.shields.io/travis/gcanti/tcomb/master.svg?style=flat-square)](https://travis-ci.org/gcanti/tcomb-react)
[![dependency status](https://img.shields.io/david/gcanti/tcomb.svg?style=flat-square)](https://david-dm.org/gcanti/tcomb-react)
![npm downloads](https://img.shields.io/npm/dm/tcomb-react.svg)

# Features

- builds on [tcomb](https://github.com/gcanti/tcomb) library
- additional fine grained type checks, nestable at arbitrary level
- **by default props are required**, a saner default since it's quite easy to forget `.isRequired`
- **checks for unwanted additional props**

# ES7 decorator

```js
import { props, t } from 'tcomb-react';

const Gender = t.enums.of(['Male', 'Female'], 'Gender');
const URL = t.subtype(t.String, s => s.startsWith('http'), 'URL');

@props({
  name: t.String,
  surname: t.maybe(t.String),
  age: t.Number,
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
  name: t.String,
  ...
}), () => { ... }))
```

## Unwanted additional props

By default tcomb-react checks unwanted additional props:

```js
@props({
  name: t.String
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
  name: t.String
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

var Gender = t.enums.of(['Male', 'Female'], 'Gender');
var URL = t.subtype(t.String, function (s) { return s.startsWith('http'); }, 'URL');

var Card = React.createClass({

  propTypes: propTypes({
    name: t.String,
    surname: t.maybe(t.String),
    age: t.Number,
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
- `t.ReactChild`
- `t.ReactChildren`

```js
import { props, t } from 'tcomb-react';

@props({
  children: t.ReactChild // allow only one child
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
| array | array | Array |
| boolean | bool | Boolean |
| functions | func | Function |
| numbers | number | Number |
| objects | object | Object |
| strings | string | String |
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
| react child | ✘ | ReactChild |
| react children | ✘ | ReactChildren |
