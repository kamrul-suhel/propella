import React from 'react';
import Draggable from 'react-draggable';
import { Nav } from 'app/components';
import { fn } from 'app/utils';

export default class GridWrapper extends React.PureComponent {

	render() {
		const childrenWithProps = React.Children.map(this.props.children, child => React.cloneElement(child, ...this.props));

		return (
      <React.Fragment>
        <Nav {...this.props} />
  			<div className="gridwrapper">  				
                                <div class="gridwrapper-y">                
                                    <span class="axis-image" ></span>
                                    <div class="top-icon">
                                    <p>
                                        <span class="icon-slide-icon-crown"></span>
                                    </p>
                                    <p>100</p><p>
                                    </p></div>
                                    <div class="bottom-icon">
                                        <p>0</p>
                                        <p>
                                        <span class="icon-slide-icon-jester"></span>                    
                                        </p>
                                    </div>                                    
                                    <p class="axis-label">Royalty</p>
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
                                    <span class="horizontal-axis vs-class"></span>
                                    <span class="axis-image"> </span>                                       
                                        <div class="left-icon">                                        
                                            <span class="icon-slide-icon-hate"></span>                                         
                                            <p>0</p>
                                        </div>
                                        <div class="right-icon">
                                            <p>100</p>
                                            <span class="icon-slide-icon-love"></span>                 
                                        </div>
                                        <p class="axis-label">Loyalty</p>                                    
  				</div>
  			</div>
      </React.Fragment>
		);
	}
}
