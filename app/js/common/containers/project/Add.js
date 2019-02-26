import React from 'react';
import { url } from 'app/constants';
import { api, fn } from 'app/utils';
import { Nav } from 'app/components';
import { Form, TextInput } from '@xanda/react-components';

export default class List extends React.PureComponent {
  handleSubmit = async () => {
    const { title, description } = this.state
    const formData = new FormData()

    formData.append('title', title)
    formData.append('description', description)

    const response = await api.post(`/projects`, formData)
    if(!api.error(response)){
      fn.navigate(`/${url.projects}`)
    }
  }

  handleInputChange = (name, value) => this.setState({[name]: value})

	render() {
    const { projects } = this.props

		return (
      <React.Fragment>
          <Nav {...this.props} />
            <div className="centering project">
              <div className="page-wrap">
                  <div className="grid">
                      <div className="grid-xs-12 grid-s-5">
                          <div className="vertical-section-text">
                              <h1>New Project</h1>
                              <Form className="new-project" onSubmit={this.handleSubmit}>
                                  <div className="form-fields">
                                      <div className="form-field-row">
                                          <TextInput label="Project Title" name="title" className="input" validation="required" onChange={this.handleInputChange} />
                                      </div>
                                      <div className="form-field-row">
                                          <TextInput label="Project Mission" name="description" textarea validation="required" onChange={this.handleInputChange} />
                                      </div>
                                  </div>
                                  <button>Submit</button>
                              </Form>
                          </div>
                      </div>
                      <div className="grid-xs-12 grid-s-7">
                  <div className="central-graphic">
                      <img src="../../images/LayerGridStackBig.svg" alt="Big Stack" />
                  </div>
              </div>
                  </div>
              </div>
          </div>
      </React.Fragment>
	   )
   }
}
