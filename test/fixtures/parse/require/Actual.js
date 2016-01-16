import React from 'react';
import { props, t } from '../../../../.';
import User from './User';

/**
 * Component description here
 * name and surname must be both nil or both specified
 * @param name - name description
 * @param surname - surname description
 */

const Props = t.refinement(t.struct({
  name: t.maybe(User.meta.props.name),
  surname: t.maybe(User.meta.props.surname)
}), (x) => t.Nil.is(x.name) === t.Nil.is(x.surname));

@props(Props)
export default class Component extends React.Component {

  static defaultProps = {
    name: 'Giulio',
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
