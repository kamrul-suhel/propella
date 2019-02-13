import React from 'react';
import {Link} from 'react-router';
import {Slider} from '@xanda/react-components';

export default class Overview extends React.PureComponent {

    render() {
        const {positionX, positionY, icon, title, icon_path, icon_size} = this.props

        return (
            <div className="overview">
                <div className="ov-message">
                    <p>Great, you're ready to add group!</p>
                </div>

                <div className="ov-title">
                    {title}
                </div>

                <div className="ov-img-content">
                    <div className="ov-icon-path"><img src={icon ? icon.preview : icon_path}/></div>
                    <div className="ov-icon-size">{icon_size}</div>
                </div>

                <div className="royalty-wrapper">
                    <p>Royalty</p>
                    <span>{positionY}</span>
                </div>

                <div className="loyalty-wrapper">
                    <p>Loyalty</p>
                    <span>{positionX}</span>
                </div>
            </div>
        );
    }
}
