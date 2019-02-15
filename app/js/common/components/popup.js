import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {Tab} from '@xanda/react-components';
import {fn} from 'app/utils';
import {Alerts} from './';

export default class Popup extends React.PureComponent {

    render() {
        const {title, closePath, beforeTitle, afterTitle, buttons, additionalClass} = this.props

        return (
            <div className={`popup${(additionalClass ? ' '+ additionalClass : '')}`}>
                <div className="popup-header">
                    {beforeTitle &&
                    <div className="popup-header-tab">{beforeTitle}</div>
                    }
                    <div className="popup-header-title">{title}</div>
                    {afterTitle &&
                    <div className="popup-header-tab">{afterTitle}</div>
                    }
                    <Link to={closePath} className="popup-header-close"/>
                </div>
                <div className="popup-inner">
                    <Alerts/>
                    {this.props.children}
                    {buttons &&
                    <div className="popup-inner-buttons">
                        {buttons &&
                        buttons
                        }
                    </div>
                    }
                </div>

            </div>
        );
    }
}
