import React from "react";
import Draggable from "react-draggable";
import {Nav} from "app/components";
import {fn} from "app/utils";
import {
    disableBodyScroll,
    enableBodyScroll,
    clearAllBodyScrollLocks
} from "body-scroll-lock";

const dblTouchTapMaxDelay = 300
let latestTouchTap = {
    time: 0,
    target: null,
}

export default class GridWrapper extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            container: null,
        };

        this._onTouchStart = this._onTouchStart.bind(this);
    }

    componentDidMount() {
        const html = document.getElementsByTagName('html')
        let containerHeight = document.getElementById('app');
        containerHeight.style.height = window.innerHeight - 40 + 'px';
        disableBodyScroll(html)

        this.setState({
            container: {
                width: this.container.offsetWidth,
                height: this.container.offsetHeight,
            }
        });
    }

    _onTouchStart(e) {
        const {location, router} = this.props;
        e.persist();
        const doubleTouch = this.isDblTouchTap(e);
        if (doubleTouch) {
            const zoomLabel = fn.getZoomLabel(e.touches[0]);
            let url = location.pathname;
            if (fn.isZoom(location)) {
                const replace = `/zoom`
                url = _.replace(url, replace, '');
                // zoom out
                url = url + '?zoomOut=true'
                router.push(url);
            } else {
                // Zoom in
                url = `${url}/zoom?zoom=${zoomLabel}`
                router.push(url);
            }
        }
    }

    onHandleDoubleClick = (event) => {
        event.persist();
        const {location, router} = this.props;
        const zoomLabel = fn.getZoomLabel(event);
        let url = location.pathname;

        if (fn.isZoom(location)) {
            const replace = `/zoom`
            url = _.replace(url, replace, '');
            // zoom out
            url = url + '?zoomOut=true'
            router.push(url);
        } else {
            // Zoom in
            url = `${url}/zoom?zoom=${zoomLabel}`
            router.push(url);
        }
    }

    isDblTouchTap(event) {
        const touchTap = {
            time: new Date().getTime(),
            target: event.currentTarget,
        }
        const isFastDblTouchTap = (
            touchTap.target === latestTouchTap.target &&
            touchTap.time - latestTouchTap.time < dblTouchTapMaxDelay
        )
        latestTouchTap = touchTap
        return isFastDblTouchTap
    }

    render() {
        const {container} = this.state;
        const {location} = this.props;
        const zoom = location.query.zoom && location.query.zoom;
        const url = location.pathname;

        const childrenWithProps = React.Children.map(this.props.children, child =>
            React.cloneElement(child, {...this.props, container: this.state.container, key: url})
        );

        return (
            <React.Fragment>
                <Nav {...this.props} />
                <div className="gridwrapper">
                    <div className="gridwrapper-y">
                        <span className="axis-image"/>
                        <div className="top-icon">
                            <span className="icon-slide-icon-crown"/>
                            <p>100</p>
                        </div>
                        <div className="bottom-icon">
                            <p>0</p>
                            <span className="icon-slide-icon-jester"/>
                        </div>
                        <p className="axis-label">Royalty</p>
                    </div>
                    <div id="gridwrapper-inner"
                         className="gridwrapper-inner"
                         onTouchStart={this._onTouchStart}
                         onDoubleClick={this.onHandleDoubleClick}
                         ref={el => (this.container = el)}>
                        {location.query.zoom ?
                            <div className="gridwrapper-inner-section-wrapper">
                                {zoom === 'up' ?
                                    <span className="gridwrapper-inner-section zoom light-blue">Upgraders</span> : null}
                                {zoom === 'vip' ?
                                    <span className="gridwrapper-inner-section zoom blue">VIP</span> : null}
                                {zoom === 'nf' ?
                                    <span className="gridwrapper-inner-section zoom orange">No Frills</span> : null}
                                {zoom === 'std' ?
                                    <span className="gridwrapper-inner-section zoom sky-blue">Standard</span> : null}
                            </div>
                            :
                            <div className="gridwrapper-inner-section-wrapper">
                                <span className="gridwrapper-inner-section">Upgraders</span>
                                <span className="gridwrapper-inner-section">VIP</span>
                                <span className="gridwrapper-inner-section">No Frills</span>
                                <span className="gridwrapper-inner-section">Standard</span>
                            </div>
                        }
                        {childrenWithProps}
                    </div>

                    <div className="gridwrapper-x">
                        <span className="axis-image"/>
                        <div className="left-icon">
                            <span className="icon-slide-icon-hate"/>
                            <p>0</p>
                        </div>
                        <div className="right-icon">
                            <p>100</p>
                            <span className="icon-slide-icon-love"/>
                        </div>
                        <p className="axis-label">Loyalty</p>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
