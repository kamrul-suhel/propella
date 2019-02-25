import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {ContentLoader, Form, Repeater, Accordion, TextInput} from '@xanda/react-components';
import {Popup} from 'app/components';
import {api} from 'app/utils';
import {url} from 'app/constants';
import * as selector from 'app/containers/group/selector';
import { ProjectWrapper } from 'app/containers/project';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();
    return {
        groups: getGroups(state, ownProps.params.id),
        group: getGroup(state, ownProps.params.groupId)
    };
})
export default class List extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            competitorsRemoved: []
        }
    }

    handleSubmit = async () => {
        const {params} = this.props
        const {competitors, competitorsRemoved} = this.state

        if (!_.isEmpty(competitors)) {
            const formData = new FormData()
            _.map(competitors, (competitor, i) => {

                // only add the id if its an existing item
                if (0 !== competitor.id) {
                    formData.append(`competitors[${i}][id]`, competitor.id)
                }

                formData.append(`competitors[${i}][title]`, competitor.title)
                formData.append(`competitors[${i}][description]`, competitor.description)
            })

            _.map(competitorsRemoved, (id) => formData.append(`competitors[deleted][${id}]`, id))

            const response = await api.put(`/groups/${params.groupId}`, formData)

            if(!api.error(response)){
                this.props.dispatch(fetchData({
                    type: 'GROUP',
                    url: `/groups/${this.props.params.groupId}`,
                }));
            }
        }
    }

    handleInputChange = (name, value) => this.setState({[name]: value})

    handleRemoved = (item) => {
        // dont record new items
        if (0 !== item.id) {
            this.setState({competitorsRemoved: [...this.state, item.id]})
        }
    }

    render() {
        const {groups, group, params} = this.props        
        return (
          <ProjectWrapper {...this.props}>
              <Popup
                  title="Competitors"
                  closePath={`/${url.projects}/${this.props.params.id}`}
                  buttons={[
                      <Link className="button"
                            to={`/${url.projects}/${this.props.params.id}/${url.groups}/${params.groupId}`}>Cancel</Link>,
                      <button onClick={this.handleSubmit} className="button">Save Changes</button>
                  ]}
                  additionalClass="competitors wide"
              >
                  <ContentLoader
                      data={groups.collection}
                      isLoading={groups.isLoading}
                  >
                      <Form onSubmit={this.handleSubmit} className="competitors-form">
                          <p className="form-label">Competitors List</p>
                          <Repeater
                              min="1"
                              max="3"
                              name="competitors"
                              onChange={this.handleInputChange}
                              onRemoved={this.handleRemoved}
                              value={group.competitors}
                          >                          
                              <Accordion
                                  title="{group.competitors}"
                              >
                                  <TextInput
                                      label="Competitor Name"
                                      name="title"
                                      onChange={this.handleInputChange}
                                      validation="required"
                                      wide
                                  />
                                  <TextInput
                                      label="Notes"
                                      name="description"
                                      onChange={this.handleInputChange}
                                      wide
                                      textarea
                                      validation="required"
                                  />
                              </Accordion>
                          </Repeater>
                      </Form>
                  </ContentLoader>
              </Popup>
            </ProjectWrapper>
        )
    }
}