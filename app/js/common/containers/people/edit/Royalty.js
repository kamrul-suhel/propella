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
                    <strong>Value, influence and power.</strong>
                    <br/>
                    <span>Think about status, seniority, knowledge, responsibility. What is their buying or influence power?</span>
                    <span>How essential are they for your mission?</span>
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
