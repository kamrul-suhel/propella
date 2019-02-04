import React from 'react';
import { Link } from 'react-router';
import { Form, Slider } from '@xanda/react-components';

export default class Loyalty extends React.PureComponent {

	render() {
    const {
      handleInputChange,
      handleSubmit,
      setFormRef,
      positionX
    } = this.props

		return (
			<Form onSubmit={handleSubmit} ref={setFormRef}>
				<p>Okay now lets see where they sit on the board</p>

				<p>Loyalty</p>

				<p>Value, influence and power. Top drawer or bottom?</p>

				<p>Lorem ipsum dolor sit amet, sed do eiusmod.</p>

				<Slider
					name="positionX"
					label="Set your Loyalty score:"
					min={0}
					max={100}
					value={positionX}
					onChange={handleInputChange}
          validation="required"
					wide
				/>
				<span class="counter">{positionX}</span>
			</Form>
		);
	}
}
