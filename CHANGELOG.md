# Changelog

> **Tags:**
> - [New Feature]
> - [Bug Fix]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]
> - [Experimental]

**Note**: Gaps between patch versions are faulty/broken releases.

# v0.9.3

- **New Feature**
    - support all tcomb types, fix #40 (@gcanti)

# v0.9.2

- **Experimental**
    - add support for [babel-plugin-tcomb](https://github.com/gcanti/babel-plugin-tcomb), fix #32 (@gcanti)
    - the following exports and augmentations are deprecated:
        - `t`
        - `t.ReactElement`
        - `t.ReactNode`
        - `t.ReactChild`
        - `t.ReactChildren`


# v0.9.1

- **New Feature**
    - account for `interface`s (tcomb ^3.1.0)

# v0.9.0

**Warning**. If you don't rely in your codebase on the property `maybe(MyType)(undefined) === null` this **is not a breaking change** for you.

- **Breaking Change**
    - upgrade to `tcomb-doc` v0.5.0
    - upgrade to `tcomb-validation` v3.0.0

# v0.8.13

- **Bug Fix**
    - `t.ReactChildren` rejects a correctly renderable `children`, fix #29 (thanks @FrancescoCioria)

# v0.8.12

- **New Feature**
    - Documentation tool: `parse` module, fix #24
    - Documentation tool: `toMarkdown` module, fix #25

# v0.8.11

- **New Feature**
    - attach the original predicate to `propTypes.__subtype__.predicate` so other components can read it
- **Internal**
    - upgrade to latest `tcomb-validation` (2.2.0)
    - add tests for production env

# v0.8.10

- **New Feature**
    - `ReactChild` and `ReactChildren` pre-defined types, fix #19 (thanks @jedmao)

# v0.8.9

- **Internal**
    - upgrade to react v0.14.0-rc1

# v0.8.8

- **New Feature**
    + additional argument `options` to `propType()` to allow a finer configuration

# v0.8.7

- **New Feature**
    + Added support for childContextTypes and contextTypes (thanks [@gavacho](https://github.com/gavacho))

# v0.8.6

- **New Feature**
    + added pre-defined types (#14):
        * `t.ReactElement`
        * `t.ReactNode`
    + `ReactElement` and `ReactNode` at top level are deprecated

# v0.8.5

- **New Feature**
    + added pre-defined types (#14):
        * `ReactElement`
        * `ReactNode`

# v0.8.4

- **Internal**
    + upgrade to latest version of tcomb-validation (2.0.0)

# v0.8.3

- **New Feature**
    + re-export tcomb

# v0.8.2

- **New Feature**
    + `propTypes` can also accept an object fix #12 (thanks @tehnomaag)

# v0.8.1

- **New Feature** (thanks @deoxxa)
    + show all the errors from tcomb-validation in warnings
    + report all additional properties, not just the first
    + retain (limited) proptypes in production

# v0.8.0

- **Breaking Change**
    + upgrade to tcomb-validation v2.0

# v0.5.0

- **New Feature**
    + If you try to pass additional props it will fail

# v0.4.0

- **New Feature**
    + Add @props ES7 decorator
- **Breaking Change**
    + Remove `react` and `t` namespace
    + Remove `ReactElement` and `ReactNode` type
    + Remove `React` dependency

# v0.3.0

- **Internal**
    + Upgrade to latest tcomb-validation
    + Remove tcomb-form and react-tools dependencies #7
- **Polish**
    + Remove Playground [BREAKING]

# v0.2.4

- **New Feature**
    + make propTypes introspectable by adding a tcomb property #6

# v0.2.3

- **Bug Fix**
    + fix a bug when propTypes is a subtype

# v0.2.2

- **Polish**
    + move tcomb-validation and tcomb-form to peerDependencies, fix #5
    + update to tcomb-form v0.4.5

# v0.2.1

- **Polish**
    + update to tcomb-form v0.4.2

# v0.2.0

- **Internal**
    + complete refactoring

