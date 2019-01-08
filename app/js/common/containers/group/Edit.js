import React from 'react';
import { Link } from 'react-router';
import Draggable from 'react-draggable';
import { Popup } from 'app/components';
import { url } from 'app/constants';
import { Form, TextInput, Radio, FileUpload } from '@xanda/react-components';
import Description from './edit/Description';
import Royalty from './edit/Royalty';
import Loyalty from './edit/Loyalty';
import Overview from './edit/Overview';

export default class List extends React.PureComponent {

	constructor(props){
		super(props)

		this.state = {
			step: 1,
			position_x: 50,
			position_y: 50
		}
	}

	handleInputChange = (name, value) => this.setState({[name]: value})

	handleStepChange = (newStep) => this.setState({step: newStep})

	handleSubmit = () => {
		return;
	}

	render() {
		const editStep = () => {
			switch (this.state.step) {
				case 1:
					return <Description handleInputChange={this.handleInputChange} />;
				case 2:
					return <Royalty handleInputChange={this.handleInputChange} positionY={this.state.position_y} />;
				case 3:
					return <Loyalty handleInputChange={this.handleInputChange} positionX={this.state.position_x} />;
				case 4:
					return <Overview />;
			}
		}

		const popupActions = () => {
			switch (this.state.step) {
				case 1:
					return (
						<React.Fragment>
							<Link to={`/${url.projects}/${this.props.params.id}/${url.groups}`} className="button">Cancel</Link>
							<button onClick={() => this.handleStepChange(2)} className="button">Next</button>
						</React.Fragment>
					);
				case 2:
					return (
						<React.Fragment>
							<button onClick={() => this.handleStepChange(1)} className="button">Back</button>
							<button onClick={() => this.handleStepChange(3)} className="button">Skip</button>
							<button onClick={() => this.handleStepChange(3)} className="button">Next</button>
						</React.Fragment>
					);
				case 3:
					return (
						<React.Fragment>
							<button onClick={() => this.handleStepChange(2)} className="button">Back</button>
							<button onClick={() => this.handleStepChange(4)} className="button">Skip</button>
							<button onClick={() => this.handleStepChange(4)} className="button">Next</button>
						</React.Fragment>
					);
				case 4:
					return (
						<React.Fragment>
							<button onClick={() => this.handleStepChange(1)} className="button">Edit</button>
							<button onClick={this.handleSubmit} className="button">Add to board</button>
						</React.Fragment>
					);
			}
		}

		return (
			<Popup
				title="Groups"
				closePath={`/${url.projects}/${this.props.params.id}`}
			>
				<Form>
					{editStep()}
					<div className="popup-inner-buttons">
						{popupActions()}
					</div>
				</Form>
			</Popup>
		);
	}
}
