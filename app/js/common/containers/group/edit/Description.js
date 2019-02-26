import React from 'react';
import {Link} from 'react-router';
import {Tooltip, Form, TextInput, Radio, FileUpload} from '@xanda/react-components';

export default class Description extends React.PureComponent {


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
            setFormRef
        } = this.props

        const fileUploadClass = (icon || icon_path) ? 'has-file' : 'has-no-file'

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
