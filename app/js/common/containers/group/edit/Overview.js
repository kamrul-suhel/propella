import React from 'react';
import { Link } from 'react-router';
import { Slider } from '@xanda/react-components';

export default class Overview extends React.PureComponent {

	render() {
    const { positionX, positionY } = this.props

		return (
                <div class="success-add-group">
                        <div class="success-message">
                            <p>Great, you're ready to add group!</p>
                        </div>  
                        
                        <div class="royalty-wrapper">
                            <p>Royalty</p>
                            <span>{positionY}</span>
                        </div>
                        
                        <div class="loyalty-wrapper">
                            <p>Loyalty</p>
                            <span>{positionX}</span>
                        </div>                               
                        
                </div>
		);
	}
}
