'use strict';

var React = require('react');
var transform = require('react-tools').transform;
var t = require('tcomb-form');
var toPropTypes = require('.').react.toPropTypes;

var Form = t.form.Form;

function defaultTemplate(locals) {
  return (
    <div className="row">
      <div className="col-sm-12">
        <h1>{locals.displayName} playground</h1>
      </div>
      <div className="col-sm-6">
        <h3>Props</h3>
        <p><b>Hint</b>: Changes will be reflected in the preview</p>
        {locals.Form}
        <button onClick={locals.onChange}>Show</button>
      </div>
      <div className="col-sm-6">
        <h3>Preview</h3>
        <div ref={locals.previewRef}></div>
      </div>
    </div>
  );
}

var PlaygroundProps = t.struct({
  component: t.Func,
  template: t.maybe(t.Func),
  props: t.Type,
  form: t.maybe(t.Obj)
});

var Playground = React.createClass({

  // dogfooding
  propTypes: toPropTypes(PlaygroundProps, {debug: true}),

  onChange: function (value) {
    if (value) {
      React.render(<this.props.component {...value} />, this.refs.preview.getDOMNode());
    }
  },

  getValue: function (raw) {
    return this.refs.form.getValue(raw);
  },

  render: function () {

    var locals = {
      displayName: this.props.component.displayName,
      Form: <Form ref="form" type={this.props.props} options={this.props.form} onChange={this.onChange} />,
      previewRef: 'preview'
    };

    return (this.props.template || defaultTemplate)(locals);
  }

});

// add a custom trasformer for ReactNode to tcomb-form config
// see http://gcanti.github.io/tcomb-form/guide/index.html#transformers
t.form.config.transformers.ReactNode = {

  format: function (element) {
    return t.react.ReactElement.is(element) ? React.renderToStaticMarkup(element) :
      t.Nil.is(element) ? null :
      String(element);
  },

  parse: function (jsx) {
    try {
      return eval(transform(jsx));
    } catch (e) {
      return jsx;
    }
  }

};

module.exports = Playground;