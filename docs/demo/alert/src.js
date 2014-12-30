'use strict';

var React = require('react');
var t = require('../../../.');

var AlertType = t.enums.of('info success danger warning');

var AlertProps = t.struct({
  type: AlertType,
  children: t.react.ReactNode
});

var Alert = React.createClass({

  propTypes: t.react.toPropTypes(AlertProps),

  render: function () {
    return (
      <div
      className={'alert alert-' + this.props.type}>
      {this.props.children}
      </div>
    );
  }

});

var Playground = require('../../../Playground.jsx');

var form = {
  auto: 'labels',
  value: {
    type: 'info',
    children: <b>You can use JSX in the form</b>
  }
};

var playground = React.render(
  <Playground
    component={Alert}
    props={AlertProps}
    form={form} />,
  document.getElementById('app')
);

playground.show();