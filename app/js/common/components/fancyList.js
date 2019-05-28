import React from 'react';
import {enableBodyScroll} from "body-scroll-lock";

export default class FancyList extends React.PureComponent {

    componentDidMount(){
        const popupElement = document.getElementById('fancylist')
        enableBodyScroll(popupElement)
    }

    render() {
        const {hideable} = this.props

        return (
            <ul className="fancylist" id="fancylist">
                {this.props.children}
            </ul>
        );
    }
}
