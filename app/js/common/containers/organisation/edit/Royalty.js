import React from 'react';
import { Link } from 'react-router';
import { Form, Slider } from '@xanda/react-components';

export default class Royalty extends React.PureComponent {

	render() {
    const {
      handleInputChange,
      handleSubmit,
      setFormRef,
      positionY
    } = this.props

		return (
			<Form onSubmit={handleSubmit} ref={setFormRef}>
				<p>Okay now lets see where they sit on the board</p>

				<p>Royalty</p>

				<p>Value, influence and power. Top drawer or bottom?</p>

				<p>Lorem ipsum dolor sit amet, sed do eiusmod.</p>

				<Slider
					name="positionY"
					label="Set your Royalty score:"
					min={0}
					max={100}
					value={positionY}
					onChange={handleInputChange}
          validation="required"
					wide
				/>
				<span className="counter">{positionY}</span>
			</Form>
		);
	}
}
