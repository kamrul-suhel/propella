import React from 'react';
import {Link} from 'react-router';
import {Form, Slider} from '@xanda/react-components';
import { fn } from 'app/utils';

export default class Royalty extends React.PureComponent {

    render() {
        const {
            handleInputChange,
            handleSubmit,
            setFormRef,
            positionY
        } = this.props

        const intPositionY = fn.convertFloatToInt(positionY);

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef}>
                <p className="form-label form-label-title">Okay now lets see where they sit on the board</p>
                <p className="h2">Royalty</p>
                <p className="slider-description">
                    <strong>Value, influence and power.</strong>
                    <br/>
                    How important is this group to your organisation in terms of spend for your services and  contribution to your reputation. Is this group increasing or decreasing in size or value? What about existing and potential kudos?
                    <br/>
                    Any group above the 50 line is significant to your future.
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