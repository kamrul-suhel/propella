import React from 'react';
import {enableBodyScroll} from "body-scroll-lock";
import {fn} from 'app/utils';
import {withRouter} from "react-router";

class FancyList extends React.PureComponent {

    componentDidMount(){
        const popupElement = document.getElementById('fancylist')
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
            console.log(event.target)

            if(navElement.contains(event.target)){
                return;
            }

            const url = fn.previousLink(params, location)
            router.push(url)
        }
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

export default withRouter(FancyList)