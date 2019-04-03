import React from "react";
import { fetchData } from "app/actions";
import { connect } from "react-redux";
import { url } from "app/constants";
import { api, fn } from "app/utils";
import { Nav } from "app/components";
import * as selector from "./selector";
import { Form, TextInput } from "@xanda/react-components";

@connect((state, ownProps) => {
  const getProjects = selector.makeGetProjects();
  const getProject = selector.makeGetProject();

  return {
    projects: getProjects(state),
    project: getProject(state, ownProps.params.id)
  };
})
export default class Edit extends React.PureComponent {
  componentDidMount() {
    if(this.props.params.id && 'add' !== this.props.params.id){
      this.fetchData();
    }
  }

  fetchData = () => {
      this.props.dispatch(fetchData({
          type: 'PROJECT',
          url: `/projects/${this.props.params.id}`,
      }));
  }

  handleSubmit = async () => {
    const { params } = this.props;
    const { title, description, measurement } = this.state;
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("measurement", measurement);


    let response
    if(params.id && 'add' !== params.id) {
      response = await api.put(`/projects/${params.id}`, formData);
    } else {
      response = await api.post(`/projects`, formData);
    }

    if (!api.error(response)) {
      fn.navigate(`/${url.projects}`);
    }
  };

  handleInputChange = (name, value) => this.setState({ [name]: value });

  render() {
    const { project } = this.props;

    return (
      <React.Fragment>
        <Nav {...this.props} />
        <div className="centering project">
          <div className="page-wrap">
            <div className="grid">
              <div className="grid-xs-12 grid-s-5">
                <div className="vertical-section-text">
                  <h1 className="page-title">
                    {this.props.params.id && 'add' !== this.props.params.id ? (
                      <span>Edit Project</span>
                    ):(
                      <span>New Project</span>
                    )}
                  </h1>
                  <Form className="new-project" onSubmit={this.handleSubmit}>
                    <div className="form-fields">
                      <div className="form-field-row">
                        <TextInput
                          label="Project Title"
                          name="title"
                          className="input"
                          validation="required"
                          onChange={this.handleInputChange}
                          value={project.title}
                        />
                      </div>
                      <div className="form-field-row">
                        <TextInput
                          label="Project Mission"
                          name="description"
                          textarea
                          validation="required"
                          onChange={this.handleInputChange}
                          value={project.description}
                        />
                      </div>

                      <div className="form-field-row">
                        <TextInput
                            label="Project Measurement"
                            name="measurement"
                            textarea
                            validation="required"
                            onChange={this.handleInputChange}
                            value={project.measurement}
                        />
                      </div>
                    </div>
                    <button>Submit</button>
                  </Form>
                </div>
              </div>
              <div className="grid-xs-12 grid-s-7">
                <div className="central-graphic">
                  <img
                    src="../../images/LayerGridStackBig.svg"
                    alt="Big Stack"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
