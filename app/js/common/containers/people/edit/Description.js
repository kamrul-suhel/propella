import React from 'react';
import {Link} from 'react-router';
import {Tooltip, Form, TextInput, Radio, FileUpload, Select} from '@xanda/react-components';

export default class Description extends React.PureComponent {

    render() {
        const {
            title,
            description,
            abbreviation,
            type_id,
            icon,
            icon_path,
            icon_size,
            handleInputChange,
            handleSubmit,
            peopleTypes,
            organisations,
            organisation_id,
            setFormRef,
            location
        } = this.props
        
        const fileUploadClass = (icon || icon_path) ? 'has-file' : 'has-no-file'

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef} className="new-person">
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
                
                <div className="grid">
                
                    <div className="grid-xs-7">
                        <div className="form-group form-group-wide group-half-size">
                            <span className="form-label">Choose Icon or Set Abbreviation <Tooltip icon="i" message="Upload a custom icon or enter an abbreviation"/></span>

                            <FileUpload                            
                                name="icon"
                                onChange={handleInputChange}
                                value={icon}
                                className={fileUploadClass}                                
                                placeholder=""
                            >
                                {<img src={icon ? icon.preview : icon_path}/>}
                            </FileUpload>
                            <TextInput
                                    name="abbreviation"
                                    value={abbreviation}
                                    onChange={handleInputChange}
                                />
                        </div>
                    </div>
                
                    <div className="grid-xs-5">

                        <Radio
                            name="icon_size"
                            label="Choose an icon"
                            options={
                                [
                                    {
                                        id: 'm',
                                        title: "M"
                                    },
                                    {
                                        id: 'f',
                                        title: "F"
                                    },
                                ]
                            }
                            styled
                            wide
                            value={icon_size}
                            onChange={handleInputChange}
                            className="radio-gender"
                        />

                    </div>
                
                </div>

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