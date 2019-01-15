import React from 'react';
import Draggable from 'react-draggable';

export default class GridWrapper extends React.PureComponent {

	render() {
		const childrenWithProps = React.Children.map(this.props.children, child => React.cloneElement(child, ...this.props));
		
		return (
			<div className="gridwrapper">
				<div className="gridwrapper-y">
					<span className="gridwrapper-y-bottom">0</span>
					<span className="gridwrapper-y-label">Royalty</span>
					<span className="gridwrapper-y-top">100</span>
				</div>
				<div className="gridwrapper-inner">
					<div className="gridwrapper-inner-section-wrapper">
						<span className="gridwrapper-inner-section">Upgraders</span>
						<span className="gridwrapper-inner-section">VIP</span>
						<span className="gridwrapper-inner-section">No Frills</span>
						<span className="gridwrapper-inner-section">Standard</span>
					</div>
					{childrenWithProps}
				</div>
				<div className="gridwrapper-x">
					<span className="gridwrapper-x-bottom">0</span>
					<span className="gridwrapper-x-label">Loyalty</span>
					<span className="gridwrapper-x-top">100</span>
				</div>
			</div>
		);
	}
}
