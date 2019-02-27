import React from 'react';
import { Link } from 'react-router';
import { Tooltip, Form, TextInput, Radio, FileUpload, Select } from '@xanda/react-components';

export default class Description extends React.PureComponent {

    renderProjectUserTitle = (u) => {
        return (
          <React.Fragment>
            <span>{u.display_name}</span>
            <span className="user-color-dot" style={{backgroundColor: u.profile_colour}}></span>
          </React.Fragment>
        )
    }

    render() {
        const {
            title,
            description,
            abbreviation,
            icon,
            icon_path,
            icon_size,
            handleInputChange,
            handleSubmit,
            setFormRef,
            projectUsers,
            rel_user_id
        } = this.props

        const fileUploadClass = (icon || icon_path) ? 'has-file' : 'has-no-file'

        const projectUserOptions = _.map(projectUsers.collection, (u) => { return {'id': u.ID, 'title': this.renderProjectUserTitle(u)}})

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef}>
                <TextInput
                    name="title"
                    label="Name Your Group"
                    validation="required"
                    onChange={handleInputChange}
                    value={title}
                    wide
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
                                accept=".jpg,.jpeg,.gif,.png,.svg"
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
                            validation="required"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <Select
                  name="rel_user_id"
                  value={rel_user_id}
                  label="Assign a User to This Group"
                  options={projectUserOptions}
                  onChange={handleInputChange}
                  className="project-user-select"
                />

                <TextInput
                    name="description"
                    label="What is this Group About?"
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
