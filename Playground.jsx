'use strict';

var React = require('react');
var transform = require('react-tools').transform;
var t = require('tcomb-form');

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

var Playground = React.createClass({

  getInitialState: function () {
    var Form = t.form.create(this.props.type, this.props.options);
    return {
      Form: Form
    };
  },

  show: function (rawValue) {
    var value = this.refs.form.getValue();
    if (value) {
      React.render(<this.props.component {...value} />, this.refs.preview.getDOMNode());
    }
  },

  render: function () {
    return (
      <div>
        <h1>{this.props.component.displayName} playground</h1>
        <h3>Preview</h3>
        <div ref="preview"></div>
        <h3>Props</h3>
        <p><b>Hint</b>: Changes will be reflected in the preview</p>
        <this.state.Form ref="form" onChange={this.show} />
        <button onClick={this.show}>Show</button>
      </div>
    );
  }

});

module.exports = Playground;