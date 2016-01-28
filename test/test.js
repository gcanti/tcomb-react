/* global describe,it */
'use strict';
var assert = require('assert');
var doesNotThrow = assert.doesNotThrow;
var React = require('react');
var t = require('tcomb-validation');
var library = require('../index');
var getPropTypes = library.propTypes;
var ReactElement = library.ReactElement;
var ReactNode = library.ReactNode;
var path = require('path');
var fs = require('fs');
var parse = require('../lib/parse');
var toMarkdown = require('../lib/toMarkdown');

function throwsWithMessage(f, message) {
  assert.throws(f, function (err) {
    assert.ok(err instanceof Error);
    assert.strictEqual(err.message, message);
    return true;
  });
}

function runPropTypes(propTypes, props) {
  for (var prop in propTypes) {
    propTypes[prop](props, prop, '<diplayName>');
  }
}

function production(f) {
  return function () {
    process.env.NODE_ENV = 'production';
    try {
      f();
    } catch (e) {
      assert.fail(e.message);
    }
    finally {
      process.env.NODE_ENV = 'development';
    }
  };
}

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
    var T = t.struct({name: t.String});
    var propTypes = getPropTypes(T);
    assert.ok(typeof propTypes === 'object');
    assert.deepEqual(Object.keys(propTypes), ['name', '__strict__']);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, '[tcomb] Invalid prop "name" supplied to <diplayName>, should be a String.\n\nDetected errors (1):\n\n 1. Invalid value undefined supplied to String\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should accept a hash of props instead of a struct', function () {
    var propTypes = getPropTypes({name: t.String});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {});
    }, '[tcomb] Invalid prop "name" supplied to <diplayName>, should be a String.\n\nDetected errors (1):\n\n 1. Invalid value undefined supplied to String\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
    doesNotThrow(function() {
      runPropTypes(propTypes, {name: 'a', __strict__: void 0, __subtype__: void 0});
    });
  });

  it('should check a subtype', function () {
    var T = t.subtype(t.struct({name: t.String}), function startsWithA(x) {
      return x.name.indexOf('a') === 0;
    });
    var propTypes = getPropTypes(T);
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'b'});
    }, '[tcomb] Invalid props:\n\n{\n  \"name\": \"b\"\n}\n\nsupplied to <diplayName>, should be a {{name: String} | startsWithA} subtype.');
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a'});
    });
  });

  it('should check additional props', function () {
    var propTypes = getPropTypes({name: t.String});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {name: 'a', surname: 'b'});
    }, '[tcomb] Invalid additional prop(s):\n\n[\n  "surname"\n]\n\nsupplied to <diplayName>.');
  });

  it('should allow to opt-out the additional props check', function () {
    var propTypes = getPropTypes({name: t.String}, { strict: false });
    doesNotThrow(function () {
      runPropTypes(propTypes, {name: 'a', surname: 'b'});
    });
  });

  it('should be a no-op in production', function () {
    var T = t.subtype(t.struct({name: t.String}), function startsWithA(x) {
      return x.name.indexOf('a') === 0;
    });
    var propTypes = getPropTypes(T);
    production(function () {
      runPropTypes(propTypes, {});
      assert.equal(propTypes.name('s'), undefined);
      assert.equal(propTypes.__strict__, undefined);
      assert.equal(propTypes.__subtype__, undefined);
    });
  });

});

describe('pre-defined types', function () {

  it('should check ReactElement(s)', function () {
    var propTypes = getPropTypes({el: ReactElement});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: 'a'});
    }, '[tcomb] Invalid prop \"el\" supplied to <diplayName>, should be a ReactElement.\n\nDetected errors (1):\n\n 1. Invalid value "a" supplied to ReactElement\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
  });

  it('should check ReactNode(s)', function () {
    var propTypes = getPropTypes({el: ReactNode});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: true});
    }, '[tcomb] Invalid prop "el" supplied to <diplayName>, should be a ReactNode.\n\nDetected errors (1):\n\n 1. Invalid value true supplied to ReactNode\n\n');
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

  it('should check ReactChild', function () {
    var propTypes = getPropTypes({el: t.ReactChild});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: {}});
    }, '[tcomb] Invalid prop \"el\" supplied to <diplayName>, should be a ReactChild.\n\nDetected errors (1):\n\n 1. Invalid value {} supplied to ReactChild\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: true});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 'a'});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: 1});
    });
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: React.createElement('div')});
    });
  });

  it('should check ReactChildren', function () {
    var propTypes = getPropTypes({el: t.ReactChildren});
    throwsWithMessage(function () {
      runPropTypes(propTypes, {el: {}});
    }, '[tcomb] Invalid prop \"el\" supplied to <diplayName>, should be a ReactChildren.\n\nDetected errors (1):\n\n 1. Invalid value {} supplied to ReactChildren\n\n');
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: true});
    });
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
      runPropTypes(propTypes, {el: [true, React.createElement('div')]});
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
    doesNotThrow(function () {
      runPropTypes(propTypes, {el: [ 'hello', [ null, 'a' ] ]});
    });
  });

});

var skipDirectories = {
  '.DS_Store': 1
};

describe('parse', function () {
  var fixturesDir = path.join(__dirname, 'fixtures/parse');
  fs.readdirSync(fixturesDir).map(function (caseName) {
    if ((caseName in skipDirectories)) {
      return;
    }
    it(caseName, function () {
      var fixtureDir = path.join(fixturesDir, caseName);
      var filepath = path.join(fixtureDir, 'Actual.js');
      var expected = require(path.join(fixtureDir, 'expected.json'));
      assert.deepEqual(JSON.stringify(parse(filepath)), JSON.stringify(expected));
    });
  });
});

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('toMarkdown', function () {
  var fixturesDir = path.join(__dirname, 'fixtures/toMarkdown');
  fs.readdirSync(fixturesDir).map(function (caseName) {
    if ((caseName in skipDirectories)) {
      return;
    }
    it(caseName, function () {
      var actualFixtureDir = path.join(__dirname, 'fixtures/parse', caseName);
      var filepath = path.join(actualFixtureDir, 'Actual.js');
      var fixtureDir = path.join(fixturesDir, caseName);
      const expected = fs.readFileSync(path.join(fixtureDir, 'expected.md')).toString();
      assert.equal(trim(toMarkdown(parse(filepath))), trim(expected));
    });
  });
});

