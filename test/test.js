'use strict';
var assert = require('assert');
var throwsWithMessage = function (f, message) {
  assert.throws(f, function (err) {
    assert.ok(err instanceof Error);
    assert.strictEqual(err.message, message);
    return true;
  });
};
var doesNotThrow = assert.doesNotThrow;
var React = require('react');
var t = require('tcomb-validation');
var library = require('../index');
var getPropTypes = library.propTypes;
var ReactElement = library.ReactElement;
var ReactNode = library.ReactNode;

var runPropTypes = function (propTypes, props) {
  for (var prop in propTypes) {
    propTypes[prop](props, prop, '<diplayName>');
  }
};

describe('exports', function () {

  it('should export tcomb', function () {
    assert.ok(library.t === t);
  });

  it('should export propTypes function', function () {
    assert.ok(typeof getPropTypes === 'function');
  });

  it('should export the es7 decorator', function () {
    assert.ok(typeof library.props === 'function');
  });

  it('should export ReactElement type', function () {
    assert.ok(ReactElement.meta.kind === 'irreducible');
  });

  it('should export ReactNode type', function () {
    assert.ok(ReactNode.meta.kind === 'irreducible');
  });

});

describe('propTypes', function () {

  it('should check bad values', function () {
    var T = t.struct({name: t.Str});
    var propTypes = getPropTypes(T);
    assert.ok(typeof propTypes === 'object');
    assert.deepEqual(Object.keys(propTypes), ['name', '__strict__']);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, 'Invalid prop \"name\" supplied to <diplayName>, should be a Str.\n\nDetected errors (1):\n\n 1. / is undefined should be a Str\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should accept a hash of props instead of a struct', function () {
    var propTypes = getPropTypes({name: t.Str});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, 'Invalid prop \"name\" supplied to <diplayName>, should be a Str.\n\nDetected errors (1):\n\n 1. / is undefined should be a Str\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should check a subtype', function () {
    var T = t.subtype(t.struct({name: t.Str}), function startsWithA(x) {
      return x.name.indexOf('a') === 0;
    });
    var propTypes = getPropTypes(T);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'b'});
    }, 'Invalid props {\"name\":\"b\"} supplied to <diplayName>, should be a {{name: Str} | startsWithA}.');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should check additional props', function () {
    var propTypes = getPropTypes({name: t.Str});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'a', surname: 'b'});
    }, 'Invalid additional prop(s) ["surname"] supplied to <diplayName>.');
  });

});

describe('pre-defined types', function () {

  it('should check ReactElement(s)', function () {
    var propTypes = getPropTypes({el: ReactElement});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: 'a'});
    }, 'Invalid prop \"el\" supplied to <diplayName>, should be a ReactElement.\n\nDetected errors (1):\n\n 1. / is "a" should be a ReactElement\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
  });

  it('should check ReactNode(s)', function () {
    var propTypes = getPropTypes({el: ReactNode});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: true});
    }, 'Invalid prop \"el\" supplied to <diplayName>, should be a ReactNode.\n\nDetected errors (1):\n\n 1. / is true should be a ReactNode\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 'a'});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 1});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: ['a', React.createElement('div')]});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: [1, React.createElement('div')]});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: [React.createElement('div'), React.createElement('a')]});
    });
  });

});