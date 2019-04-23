import React from 'react';
import {Link} from 'react-router';
import {Form, Slider} from '@xanda/react-components';
import {fn} from 'app/utils';

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
                    <strong>Value, influence and power. Top drawer or bottom?</strong>
                    <br/>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                    labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                    nisi ut aliquip ex ea commodo consequat.
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
                <span className="counter">{intPositionX}</span>
            </Form>
        );
    }
}
