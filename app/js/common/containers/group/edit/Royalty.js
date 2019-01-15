import React from 'react';
import { Link } from 'react-router';
import { Slider } from '@xanda/react-components';

export default class Royalty extends React.PureComponent {

	render() {
		const { handleInputChange } = this.props

		return (
			<React.Fragment>
				<p>Okay now lets see where they sit on the board</p>

				<p>Royalty</p>

				<p>Value, influence and power. Top drawer or bottom?</p>

				<p>Lorem ipsum dolor sit amet, sed do eiusmod.</p>

				<Slider
					name="position_y"
					label="Set your Royalty score:"
					min={0}
					max={100}
					value={50}
					onChange={handleInputChange}
					wide
				/>
				<span>{this.props.positionY}</span>
			</React.Fragment>
		);
	}
}