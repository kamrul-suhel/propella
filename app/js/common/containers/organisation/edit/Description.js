import React from 'react';
import { Link } from 'react-router';
import { Form, TextInput, Radio, FileUpload, Select } from '@xanda/react-components';

export default class Description extends React.PureComponent {

	render() {
		const {
                    title,
                    description,
                    abbreviation,
                    icon,
                    type_id,
                    icon_size,
                    handleInputChange,
                    handleSubmit,
                    organisationTypes,
                    setFormRef
    } = this.props

		return (
			<Form onSubmit={handleSubmit} ref={setFormRef}>
				<TextInput
					name="title"
					label="Organisation's Name"
					validation="required"
					onChange={handleInputChange}
                                        value={title}
					wide
				/>

                                <Select
                                  name="type_id"
                                  value={type_id}
                                  onChange={handleInputChange}
                                  label="Type of Stakeholder"
                                  options={organisationTypes}
                                />
                                <div className="grid">
                                    <div className="grid-xs-6">
                                        <TextInput
                                                name="abbreviation"
                                                value={abbreviation}
                                                onChange={handleInputChange}
                                                label="Set an Abbreviation"
                                        />
                                    </div>
                                    <div className="grid-xs-6">
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
                                                value={icon_size}
                                                onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

				<TextInput
					name="description"
					label="Give a Description to this Organisation"
					textarea
                                        value={description}
					onChange={handleInputChange}
                                        validation="required"
					wide
				/>
			</Form>
		);
	}
}
