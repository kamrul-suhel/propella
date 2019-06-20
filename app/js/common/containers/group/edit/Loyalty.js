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
                    <strong>Knowledge, buy-in, advocacy.</strong>
                    <br/>What is the status of your relationship with this group?  Are you recognised by this group? Is this a group where you have a reputation as provider? Are you in the top five providers? What’s your market share of work in this group? Whatever percentage that is, use that number here.
                    <br/>
                    You will be a player in any group above 50.
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
