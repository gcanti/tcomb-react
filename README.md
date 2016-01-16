[![build status](https://img.shields.io/travis/gcanti/tcomb-react/master.svg?style=flat-square)](https://travis-ci.org/gcanti/tcomb-react)
[![dependency status](https://img.shields.io/david/gcanti/tcomb-react.svg?style=flat-square)](https://david-dm.org/gcanti/tcomb-react)
![npm downloads](https://img.shields.io/npm/dm/tcomb-react.svg)

# Features

- **by default props are required**, a saner default since it's quite easy to forget `.isRequired`
- **checks for unwanted additional props**
- **documentation** (types and comments) can be automatically extracted
- additional fine grained type checks, nestable at arbitrary level
- builds on [tcomb](https://github.com/gcanti/tcomb), [tcomb-validation](https://github.com/gcanti/tcomb-validation), [tcomb-doc](https://github.com/gcanti/tcomb-doc) libraries

# Prop types

## The `@props` decorator (ES7)

For an equivalent implementation in ES5 see the `propTypes` function below.

**Signature**

```js
type Props = {[key: string]: TcombType};

@props(type: Props | TcombType, options?: Object)
```

where

- `type` can be a map `string -> TcombType`, a `tcomb` struct or a refinement of a struct
- `options`:
  - `strict: boolean` (default `true`) if `true` checks for unwanted additional props

**Example** (ES7)

```js
import { props, t } from 'tcomb-react';

const Gender = t.enums.of(['Male', 'Female'], 'Gender');
const URL = t.refinement(t.String, (s) => s.startsWith('http'), 'URL');

@props({
  name: t.String,             // a required string
  surname: t.maybe(t.String), // an optional string
  age: t.Number,              // a required number
  gender: Gender,             // an enum
  avatar: URL                 // a refinement
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

**Unwanted additional props**

By default `tcomb-react` checks for unwanted additional props:

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

**Output**

```
Warning: Failed propType: [tcomb] Invalid additional prop(s):

[
  "surname"
]

supplied to Person.
```

**Note**. You can **opt-out** passing the `option` argument `{ strict: false }`.

## The `propTypes` function (ES5)

**Signature**

Same as `@props`.

**Example** (ES5)

```js
var t = require('tcomb-react').t;
var propTypes = require('tcomb-react').propTypes;

var Gender = t.enums.of(['Male', 'Female'], 'Gender');
var URL = t.refinement(t.String, function (s) { return s.startsWith('http'); }, 'URL');

var Card = React.createClass({

  propTypes: propTypes({
    name: t.String,             // a required string
    surname: t.maybe(t.String), // an optional string
    age: t.Number,              // a required number
    gender: Gender,             // an enum
    avatar: URL                 // a refinement
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

# Extract documentation from your components

## The `parse` function

Given a path to a component file returns a JSON / JavaScript blob containing **props types, default values and comments**.

**Signature**

```js
(path: string | Array<string>) => Object
```

**Example**

Source

```js
import { t, props } from 'tcomb-react'

/**
 * Component description here
 * @param name - name description here
 * @param surname - surname description here
 */

@props({
  name: t.String,             // a required string
  surname: t.maybe(t.String)  // an optional string
})
export default class Card extends React.Component {

  static defaultProps = {
    surname: 'Canti'          // default value for surname prop
  }

  render() {
    return (
      <div>
        <p>{this.props.name}</p>
        <p>{this.props.surname}</p>
      </div>
    );
  }
}
```

Usage

```js
import parse from 'tcomb-react/lib/parse'
const json = parse('./components/Card.js')
console.log(JSON.stringify(json, null, 2))
```

Output

```json
{
  "name": "Card",
  "description": "Component description here",
  "props": {
    "name": {
      "kind": "irreducible",
      "name": "String",
      "required": true,
      "description": "name description here"
    },
    "surname": {
      "kind": "irreducible",
      "name": "String",
      "required": false,
      "defaultValue": "Canti",
      "description": "surname description here"
    }
  }
}
```

**Note**. Since `parse` uses runtime type introspection, your components should be `require`able from your script (you may be required to shim the browser environment).

**Parsing multiple components**

```js
import parse from 'tcomb-react/lib/parse'
import path import 'path'
import glob import 'glob'

function getPath(file) {
  return path.resolve(process.cwd(), file);
}

parse(glob.sync('./components/*.js').map(getPath));
```

## The `toMarkdown` function

Given a JSON / JavaScript blob returned by `parse` returns a markdown containing the components documentation.

**Signature**

```js
(json: Object) => string
```

**Example**

Usage

```js
import parse from 'tcomb-react/lib/parse'
import toMarkdown from 'tcomb-react/lib/toMarkdown'
const json = parse('./components/Card.js')
console.log(toMarkdown(json));
```

Output

```markdown
## Card

Component description here

**Props**

- `name: String` name description here
- `surname: String` (optional, default: `"Canti"`) surname description here

```

# Augmented pre-defined types

`tcomb-react` exports some useful pre-defined types:

- `t.ReactElement`
- `t.ReactNode`
- `t.ReactChild`
- `t.ReactChildren`

**Example**

```js
import { props, t } from 'tcomb-react';

@props({
  children: t.ReactChild // only one child is allowed
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
