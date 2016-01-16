import React from 'react';
import { props, t } from '../../../../.';

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
    surname: 'Canti'
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
