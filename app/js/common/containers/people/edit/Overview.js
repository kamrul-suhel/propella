import React from 'react';
import {Link} from 'react-router';
import { fn } from 'app/utils';
import {Form, Slider} from '@xanda/react-components';

export default class Overview extends React.PureComponent {

    render() {
        const {positionX, positionY, icon, title, icon_path, icon_size} = this.props

        return (
            <div className="overview">
                <div className="ov-message">
                    <p>Great, you're ready to add group!</p>
                </div>

                <p className="ov-title h2">
                    {title}
                </p>

                <div className="ov-img-content">
                    <div className="ov-icon-path">
                        <img src={icon ? icon.preview : icon_path}/>
                        <div className="ov-icon-size"><span className={`avatar-${fn.getAvatarClass(icon_size)}`}></span></div>
                    </div>              
                </div>
                <div className="ov-scores">
                <div className="royalty-wrapper">
                    <p>Royalty</p>
                    <span>{positionY}</span>
                </div>
                <div className="loyalty-wrapper">
                    <p>Loyalty</p>
                    <span>{positionX}</span>
                </div>
                </div>
            </div>
        );
    }
}
