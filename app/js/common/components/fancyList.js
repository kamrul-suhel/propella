import React from 'react';

export default class FancyList extends React.PureComponent {

	render() {
    const { hideable } = this.props

		return (
      <ul className="fancylist">
          {this.props.children}
      </ul>
		);
	}
}
