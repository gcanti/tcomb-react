"use strict";
var assert = require('assert');
var React = require('react');
var t = require('../index');
var UnsafeAlert = require('react-bootstrap/Alert');

var Any = t.Any;
var Nil = t.Nil;
var Str = t.Str;
var Num = t.Num;
var Func = t.Func;
var subtype = t.subtype;
var struct = t.struct;
var enums = t.enums;
var maybe = t.maybe;

//
// setup
//

var ok = function (x) { assert.strictEqual(true, x); };
var ko = function (x) { assert.strictEqual(false, x); };
var eq = assert.strictEqual;
var dep = assert.deepEqual;
var throwsWithMessage = function (f, message) {
    assert['throws'](f, function (err) {
        ok(err instanceof Error);
        eq(err.message, message);
        return true;
    });
};
var doesNotThrow = assert.doesNotThrow;

//
// utils
//

describe('getDisplayName(x)', function () {

  var Factory = React.createClass({displayName: 'Factory',
    render: function () {
      return React.DOM.div();
    }
  });

  it('should return the displayName of a factory', function () {
    eq(t.react.getDisplayName(Factory), 'Factory');
  });

  it('should return the displayName of a component', function () {
    eq(t.react.getDisplayName(Factory()), 'Factory');
  });

});

describe('objectify(args)', function () {
  it('should return an object containing the props', function () {
    dep(t.react.objectify([{a: 1}]), {a: 1});
  });
  it('should return an object containing the props and one child', function () {
    dep(t.react.objectify([{a: 1}, 'b']), {a: 1, children: 'b'});
  });
  it('should return an object containing the props and an array of children', function () {
    dep(t.react.objectify([{a: 1}, 'b', 'c']), {a: 1, children: ['b', 'c']});
  });
});


//
// assertEqual
//

describe('assertEqual(props, type, [opts])', function () {

  describe('when type is a struct', function () {

    var Href = subtype(Str, function (s) {
      return s.substring(0, 1) === '#';
    }, 'Href');

    var Props = struct({
      href: Href,
      children: Str
    }, 'Anchor');

    var Anchor = React.createClass({displayName: 'Anchor',
      render: function () {
        t.react.assertEqual(this.props, Props);
        return (
          React.DOM.a({href: this.props.href}, this.props.children)
        );
      }
    });

    it('should not throw when props are correct', function () {
      React.renderComponentToString(Anchor({href: "#section"}, "title"));
      React.renderComponentToString(Anchor({href: "#section", unknown: "true"}, "title"));
    });
    it('should throw when props are incorrect', function () {
      throwsWithMessage(function () {
        React.renderComponentToString(Anchor(null, "title"));
      }, 'Invalid type argument `value` of value `undefined` supplied to `Str`, expected a `Str`.');
      throwsWithMessage(function () {
        React.renderComponentToString(Anchor({href: "#section"}));
      }, 'Invalid type argument `value` of value `undefined` supplied to `Str`, expected a `Str`.');
      throwsWithMessage(function () {
        React.renderComponentToString(Anchor({href: "http://mydomain.com"}, "title"));
      }, 'Invalid type argument `value` of value `"http://mydomain.com"` supplied to `Href`, expected a valid value for the predicate.');
      throwsWithMessage(function () {
        React.renderComponentToString(Anchor({href: "#section"}, React.DOM.span(null, "title")));
      }, 'Invalid type argument `value` of value `{"__tag__":"span","children":"title"}` supplied to `Str`, expected a `Str`.');
    });
  });

  describe('when type is a subtype', function () {

    var predicate = function (x) {
      return Nil.is(x.foo) === Nil.is(x.bar);
    };

    var Props = subtype(struct({
      foo: maybe(Str),
      bar: maybe(Str)
    }), predicate, 'Props');

    var Component = React.createClass({displayName: 'Component',
      render: function () {
        t.react.assertEqual(this.props, Props);
        return (
          React.DOM.div({foo: this.props.foo, bar: this.props.bar}, this.props.children)
        );
      }
    });

    it('should not throw when props are correct', function () {
      React.renderComponentToString(Component({foo: null, bar: null}));
      React.renderComponentToString(Component({foo: 'a', bar: 'b'}));
    });
    it('should throw when props are incorrect', function () {
      throwsWithMessage(function () {
        React.renderComponentToString(Component({foo: null, bar: 'b'}));
      }, 'Invalid type argument `value` of value `{"foo":null,"bar":"b"}` supplied to `Props`, expected a valid value for the predicate.');
      throwsWithMessage(function () {
        React.renderComponentToString(Component({foo: 'a', bar: null}));
      }, 'Invalid type argument `value` of value `{"foo":"a","bar":null}` supplied to `Props`, expected a valid value for the predicate.');
    });
  });

  describe('when type uses tags', function () {

    var Props = struct({
      href: Str,
      children: t.react.DOM.Span
    }, 'Anchor');

    var Anchor = React.createClass({displayName: 'Anchor',
      render: function () {
        t.react.assertEqual(this.props, Props);
        return (
          React.DOM.a({href: this.props.href}, this.props.children)
        );
      }
    });

    it('should not throw when props are correct', function () {
      React.renderComponentToString(Anchor({href: "#section"}, React.DOM.span(null, 'content')));
    });
    it('should throw when props are incorrect', function () {
      throwsWithMessage(function () {
        React.renderComponentToString(Anchor({href: "#section"}, 'content'));
      }, 'Invalid type argument `value` of value `"content"` supplied to `Span`, expected an `Obj`.');
    });
  });

});

//
// bind
//

describe('bind(factory, type, [opts])', function () {

  var BsStyle = enums.of('info success warning danger', 'BsStyle');
  var BsSize = enums.of('large medium small xsmall', 'BsSize');

  // onDismiss and dismissAfter must either or neither passed
  var eitherOrNeither = function (x) {
    return Nil.is(x.onDismiss) === Nil.is(x.dismissAfter);
  };

  describe('when the type is a struct', function () {

    var AlertProps = struct({
      __tag__: enums.of('Alert'),
      bsStyle: maybe(BsStyle),
      bsSize: maybe(BsSize),
      onDismiss: maybe(Func),
      dismissAfter: maybe(Num),
      children: Any
    }, 'Alert');

    var Alert = t.react.bind(UnsafeAlert, AlertProps);

    it('should be a valid ReactDescriptor', function () {
      ok(t.react.Component.is(Alert()));
    });
    it('should not throw when props are correct', function () {
      React.renderComponentToString(Alert({bsStyle: "warning"}, 'hello'));
    });
    it('should not throw when props are correct', function () {
      React.renderComponentToString(Alert({bsStyle: "warning", dismissAfter: 10}, 'hello'));
    });
    it('should throw when props are incorrect', function () {
      throwsWithMessage(function () {
        React.renderComponentToString(Alert({bsStyle: "unknown"}, 'hello'));
      }, 'Invalid type argument `value` of value `"unknown"` supplied to `BsStyle`, expected a valid enum.');
    });
  });

  describe('when the type is a subtype', function () {

    var AlertProps = subtype(struct({
      __tag__: enums.of('Alert'),
      bsStyle: maybe(BsStyle),
      bsSize: maybe(BsSize),
      onDismiss: maybe(Func),
      dismissAfter: maybe(Num),
      children: Any
    }), eitherOrNeither, 'Alert');

    var Alert = t.react.bind(UnsafeAlert, AlertProps);

    it('should not throw when props are correct', function () {
      React.renderComponentToString(Alert({bsStyle: "warning"}, 'hello'));
      React.renderComponentToString(Alert({bsStyle: "warning", dismissAfter: 10, onDismiss: function () {}}, 'hello'));
    });
    it('should throw when props are incorrect', function () {
      throwsWithMessage(function () {
        React.renderComponentToString(Alert({bsStyle: "unknown"}, 'hello'));
      }, 'Invalid type argument `value` of value `"unknown"` supplied to `BsStyle`, expected a valid enum.');
      throwsWithMessage(function () {
        React.renderComponentToString(Alert({bsStyle: "warning", dismissAfter: 10}, 'hello'));
      }, 'Invalid type argument `value` of value `{"bsStyle":"warning","dismissAfter":10,"children":"hello","__tag__":"Alert"}` supplied to `Alert`, expected a valid value for the predicate.');
    });
  });

});


