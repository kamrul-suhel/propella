import React from 'react';
import { Link } from 'react-router';
import { Form, Slider } from '@xanda/react-components';

export default class Overview extends React.PureComponent {

	render() {
    const { positionX, positionY } = this.props

		return (
			<div>
				<p>Great, you've added an organisation!</p>

				<p></p>

				<p>Royalty</p>
				<p>{positionY}</p>

				<p>Loyalty</p>
        <p>{positionX}</p>
			</div>
                        
                        
		);
	}
}
