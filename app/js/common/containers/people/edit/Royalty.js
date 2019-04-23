import React from 'react';
import {Form, Slider} from '@xanda/react-components';
import { fn } from 'app/utils'

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
                    <strong>Value, influence and power. Top drawer or bottom?</strong>
                    <br/>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                </p>
                <Slider
                    name="positionY"
                    label="Set your Royalty score:"
                    min={0}
                    max={100}
                    value={intPositionY}
                    onChange={handleInputChange}
                    validation="required"
                    wide
                />
                <span className="counter">{intPositionY}</span>
            </Form>
        );
    }
}
