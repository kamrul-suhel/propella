import React from 'react';
import { Link } from 'react-router';
import { Form, TextInput, Radio, FileUpload, Select } from '@xanda/react-components';

export default class Description extends React.PureComponent {

	render() {
		const {
      title,
      description,
      type_id,
      icon,
      icon_size,
      handleInputChange,
      handleSubmit,
      peopleTypes,
      organisations,
      organisation_id,
      setFormRef,
      location
    } = this.props

		return (
			<Form onSubmit={handleSubmit} ref={setFormRef}>
				<TextInput
					name="title"
					label="Person's Name"
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
          options={peopleTypes}
        />

        <Select
          name="organisation_id"
          value={organisation_id ? organisation_id : location.query.organisation_id}
          onChange={handleInputChange}
          label="Assign an Organisation"
          options={_.values(organisations)}
        />

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

        <FileUpload
          name="icon"
          value={icon}
          onChange={handleInputChange}
        />

				<TextInput
					name="description"
					label="Give them a description"
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
