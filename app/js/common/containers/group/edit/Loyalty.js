import React from 'react';
import { Link } from 'react-router';
import { Slider } from '@xanda/react-components';

export default class Loyalty extends React.PureComponent {

	render() {
		const { handleInputChange } = this.props

		return (
			<React.Fragment>
				<p>Okay now lets see where they sit on the board</p>

				<p>Loyalty</p>

				<p>Value, influence and power. Top drawer or bottom?</p>

				<p>Lorem ipsum dolor sit amet, sed do eiusmod.</p>

				<Slider
					name="position_x"
					label="Set your Loyalty score:"
					min={0}
					max={100}
					value={50}
					onChange={handleInputChange}
					wide
				/>
				<span>{this.props.positionX}</span>
			</React.Fragment>
		);
	}
}