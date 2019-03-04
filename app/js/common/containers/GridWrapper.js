import React from "react";
import Draggable from "react-draggable";
import { Nav } from "app/components";
import { fn } from "app/utils";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks
} from "body-scroll-lock";

export default class GridWrapper extends React.PureComponent {
  componentDidMount() {
    disableBodyScroll(document.querySelector("#app"));
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children, child =>
      React.cloneElement(child, ...this.props)
    );

    return (
      <React.Fragment>
        <Nav {...this.props} />
        <div className="gridwrapper">
          <div className="gridwrapper-y">
            <span className="axis-image" />
            <div className="top-icon">
              <span className="icon-slide-icon-crown" />
              <p>100</p>
            </div>
            <div className="bottom-icon">
              <p>0</p>
              <span className="icon-slide-icon-jester" />
            </div>
            <p className="axis-label">Royalty</p>
          </div>
          <div id="gridwrapper-inner" className="gridwrapper-inner">
            <div className="gridwrapper-inner-section-wrapper">
              <span className="gridwrapper-inner-section">Upgraders</span>
              <span className="gridwrapper-inner-section">VIP</span>
              <span className="gridwrapper-inner-section">No Frills</span>
              <span className="gridwrapper-inner-section">Standard</span>
            </div>
            {childrenWithProps}
          </div>
          <div className="gridwrapper-x">
            <span className="axis-image" />
            <div className="left-icon">
              <span className="icon-slide-icon-hate" />
              <p>0</p>
            </div>
            <div className="right-icon">
              <p>100</p>
              <span className="icon-slide-icon-love" />
            </div>
            <p className="axis-label">Loyalty</p>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
