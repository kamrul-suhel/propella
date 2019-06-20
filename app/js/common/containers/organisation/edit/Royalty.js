import React from 'react';
import { Form, Slider } from '@xanda/react-components';
import { fn } from 'app/utils';

export default class Royalty extends React.PureComponent {

	render() {
    const {
      handleInputChange,
      handleSubmit,
      setFormRef,
      positionY
    } = this.props

		const intPositionY = fn.convertFloatToInt(positionY)

		return (
			<Form onSubmit={handleSubmit} ref={setFormRef}>
				<p className="form-label form-label-title">Okay now lets see where they sit on the board</p>
				<p className="h2">Royalty</p>
				<p className="slider-description">
					<strong>Value, influence and power.</strong><br/>
					<span>For clients, targets, income sources and contacts, think about spend, potential spend, size, status, kudos ambition, confidence, success, ownership, stability, shared values around the environment and ethics. Also think about likeability and payment record.</span>
					<span>For media, influencers and industry associations, think size, reach, quality and followers.</span>
					<span>For suppliers, how critical are they to your success.</span>
					<span>For internal teams, how important are they to achieve your goal?</span>
					<span>Above 50 they will be significant to your future.</span>
				</p>

				<Slider
					name="positionY"
					label="Set your Royalty score:"
					min={0}
					max={100}
					value={intPositionY}
					onChange={handleInputChange}
					wide
				/>
				<span className="counter">{intPositionY}</span>
			</Form>
		);
	}
}
