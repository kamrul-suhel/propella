import React from "react";
import {Link} from "react-router";
import {
    Form,
    TextInput,
    Radio,
    FileUpload,
    Select,
    ContentLoader
} from "@xanda/react-components";

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
            type_id,
            icon_size,
            handleInputChange,
            handleSubmit,
            organisationTypes,
            setFormRef,
            projectUsers,
            rel_user_id
        } = this.props

        const projectUserOptions = _.map(projectUsers.collection, (u) => {
            return {'id': u.ID, 'title': this.renderProjectUserTitle(u)}
        })

        return (
            <Form onSubmit={handleSubmit} ref={setFormRef}>
                <TextInput
                    autoComplete="off"
                    name="title"
                    label="Organisation's Name"
                    validation="required"
                    onChange={handleInputChange}
                    value={title}
                    wide
                />

                <ContentLoader
                    data={organisationTypes.collection}
                    isLoading={organisationTypes.isLoading}
                >
                    <Select
                        name="type_id"
                        value={type_id}
                        onChange={handleInputChange}
                        label="Type of Stakeholder"
                        options={_.values(organisationTypes.collection)}
                        validation="required"
                    />
                </ContentLoader>

                <div className="grid">
                    <div className="grid-xs-6">
                        <TextInput
                            autoComplete="off"
                            name="abbreviation"
                            value={abbreviation}
                            onChange={handleInputChange}
                            label="Set an Abbreviation"
                            validation="required"
                        />
                    </div>
                    <div className="grid-xs-6">
                        <Radio
                            name="icon_size"
                            label="Choose Size of Icon"
                            options={[
                                {
                                    id: "s",
                                    title: "S"
                                },
                                {
                                    id: "m",
                                    title: "M"
                                },
                                {
                                    id: "l",
                                    title: "L"
                                }
                            ]}
                            styled
                            wide
                            value={icon_size}
                            onChange={handleInputChange}
                            validation="required"
                        />
                    </div>
                </div>

                <ContentLoader
                    data={projectUsers.collection}
                    isLoading={projectUsers.isLoading}
                >
                    <Select
                        name="rel_user_id"
                        value={rel_user_id}
                        onChange={handleInputChange}
                        label="Assign a User to this Organisation"
                        options={projectUserOptions}
                        validation="required"
                    />
                </ContentLoader>

                <div className="c-tooltip c-top">
                    <div className="c-tooltip-message">
                        Specific description<br/>
                        Overview of services<br/>
                        Turnover and other key stats<br/>
                        Position in industry<br/>
                        Website link/location/phone number<br/>
                        History and status of relationship<br/>
                        Services bought<br/>
                        Trends and developments<br/>
                        Messages<br/>
                        Stated ambition<br/>
                        Income and reputational value to your organisation<br/>
                        Recent news stories<br/>
                        Corporate responsibility<br/>
                        Interaction with your organisation’s marketing
                    </div>
                    <TextInput
                        autoComplete="off"
                        name="description"
                        label="Give a Description to this Organisation"
                        textarea
                        value={description}
                        onChange={handleInputChange}
                        validation="required"
                        wide
                    />
                </div>
            </Form>
        );
    }
}
