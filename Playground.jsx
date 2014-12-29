'use strict';

var React = require('react');
var reactTools = require('react-tools');
var t = require('tcomb-form');

t.form.config.transformers.ReactElement = {

  format: function (value) {
    return t.react.ReactElement.is(value) ? React.renderToStaticMarkup(value) : value;
  },

  parse: function (value) {
    try {
      return eval(reactTools.transform(value));
    } catch (e) {
      return value;
    }
  }

};

var Playground = React.createClass({

  getInitialState: function () {
    var PropTypes = this.props.component.TcombPropTypes;
    var Form = t.form.create(PropTypes, {
      value: this.props.props,
      auto: 'labels'
    });
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
        <this.state.Form ref="form" onChange={this.show} />
        <button onClick={this.show}>Show</button>
      </div>
    );
  }

});

module.exports = Playground;