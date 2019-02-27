import React from "react";
import { Link } from "react-router";
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
          <span className="" style={{color: u.profile_colour}}></span>
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
      projectUsers
    } = this.props

    const projectUserOptions = _.map(projectUsers.collection, (u) => { return {'id': u.ID, 'title': this.renderProjectUserTitle(u)}})

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
          />
        </ContentLoader>

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
            />
          </div>
        </div>

        <ContentLoader
          data={projectUsers.collection}
          isLoading={projectUsers.isLoading}
        >
          <Select
            name="user_id"
            value={false}
            onChange={handleInputChange}
            label="Assign a User to this Organisation"
            options={projectUserOptions}
          />
        </ContentLoader>

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
