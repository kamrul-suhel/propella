import React from 'react';
import { Link } from 'react-router';

export default class Popup extends React.PureComponent {

	render() {
		const { title, closePath } = this.props

		return (
			<div className="popup">
				<div className="popup-header">
					<h2 className="popup-header-title">{title}</h2>
					<Link to={closePath} className="popup-header-close" dangerouslySetInnerHTML={{__html: `&Cross;`}} />
				</div>
				<div className="popup-inner">
					{this.props.children}
				</div>
			</div>
		);
	}
}