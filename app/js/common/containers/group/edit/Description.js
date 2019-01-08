import React from 'react';
import { Link } from 'react-router';
import { Form, TextInput, Radio, FileUpload } from '@xanda/react-components';

export default class Description extends React.PureComponent {

	render() {
		const { handleInputChange } = this.props

		return (
			<React.Fragment>
				<TextInput 
					name="title" 
					label="Name Your Group" 
					validation="required"
					onChange={handleInputChange}
					wide
				/>

				<div className="form-group form-type-input form-group-validation-required">
					<span className="form-label">Choose Icon or Set Abbreviation</span>
					<FileUpload
						name="icon"
						onChange={handleInputChange}
					/>
					<TextInput 
						name="abbreviation"
						onChange={handleInputChange}
					/>
				</div>

				<Radio
					name="icon_size"
					label="Choose Size of Icon"
					options={
						[
							{
								id: 's',
								title: "S"
							},
							{
								id: 'm',
								title: "M"
							},
							{
								id: 'l',
								title: "L"
							},
						]
					}
					styled
					wide
					onChange={handleInputChange}
				/>

				<TextInput 
					name="description" 
					label="What is this Group About?" 
					textarea
					onChange={handleInputChange}
					wide
				/>
			</React.Fragment>
		);
	}
}