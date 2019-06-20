import React from 'react';
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

        const intPositionX = fn.convertFloatToInt(positionX)

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef}>
                <p className="form-label form-label-title">Okay now lets see where they sit on the board</p>
                <p className="h2">Loyalty</p>
                <p className="slider-description">
                    <strong>Knowledge, buy-in, advocacy.</strong>
                    <br/>
                    <span>For clients, targets, income sources and contacts - How much is your business recognised by this organisation? How much work do they give you?</span>
                    <span>Clue – The 50 point is usually marked by the issue of an invoice.</span>
                    <span>Media etc – how well known are you?</span>
                    <span>Suppliers – how important are you?</span>
                    <span>Internal – how would you rate their support for your particular mission?</span>
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
