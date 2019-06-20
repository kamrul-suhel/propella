import React from 'react';
import {Form, Slider} from '@xanda/react-components';
import { fn } from 'app/utils'

export default class Loyalty extends React.PureComponent {

    render() {
        const {
            handleInputChange,
            handleSubmit,
            setFormRef,
            positionX
        } = this.props

        const intPositionX = fn.convertFloatToInt(positionX);

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef} className="loyalty-form">
                <p className="form-label form-label-title">Okay now lets see where they sit on the board</p>

                <p className="h2">Loyalty</p>

                <p className="slider-description">
                    <strong>Knowledge, buy-in, advocacy.
                    </strong><br/>
                    <span>How well does this person know your organisation or mission? Would they recognise your name? Do they know of your reputation? Or are they actively recommending you?</span>
                    <span>Above the 50 line will be regular providers of work, profile, introductions, loyalty, support.</span>
                </p>

                <Slider
                    name="positionX"
                    label="Set your Loyalty score:"
                    min={0}
                    max={100}
                    value={intPositionX}
                    onChange={handleInputChange}
                    wide
                />
                <span className="counter">{ intPositionX }</span>
            </Form>
        );
    }
}
