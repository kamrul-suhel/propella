import React from 'react';
import {Link} from 'react-router';
import {fn} from 'app/utils';
import {Alerts} from './';
import { withRouter } from "react-router";

import { enableBodyScroll } from "body-scroll-lock";

class Popup extends React.PureComponent {

    componentDidMount(){
        const popupElement = document.getElementById('popup')
        enableBodyScroll(popupElement)
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false)
        document.addEventListener('touchstart', this.handleClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false)
        document.removeEventListener('touchstart', this.handleClick, false)
    }

    handleClick = (event) => {
        const { router, location, params } = this.props
        const element = document.getElementById('popup')
        const navElement = document.getElementById('nav')
        if(!element.contains(event.target)){
            if(navElement.contains(event.target)){
               return;
            }

            const url = fn.previousLink(params, location)
            router.push(url)
        }
    }

    render() {
        const {
            title,
            closePath,
            beforeTitle,
            afterTitle,
            buttons,
            additionalClass
        } = this.props

        return (
            <div id="popup" className={`popup${(additionalClass ? ' '+ additionalClass : '')}`}>
                <div className="popup-header">
                    {beforeTitle &&
                    <div className="popup-header-tab">{beforeTitle}</div>
                    }
                    <div className="popup-header-title">{title}</div>
                    {afterTitle &&
                    <div className="popup-header-tab">{afterTitle}</div>
                    }
                    {closePath &&
                      <Link to={closePath} className="popup-header-close"/>
                    }
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
export default withRouter(Popup)
