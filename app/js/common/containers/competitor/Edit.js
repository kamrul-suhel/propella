import React from "react";
import { fetchData } from "app/actions";
import { connect } from "react-redux";
import { Link } from "react-router";
import { url } from "app/constants";
import { api, fn } from "app/utils";
import { Nav, Popup } from "app/components";
import * as selector from "./selector";
import { makeGetProjects } from "app/containers/project/selector";
import { ProjectWrapper } from "app/containers/project";
import { Form, TextInput } from "@xanda/react-components";

@connect((state, ownProps) => {
  const getProjects = makeGetProjects();
  const getCompetitors = selector.makeGetCompetitors();
  const getCompetitor = selector.makeGetCompetitor();

  return {
    popup: state.popup,
    projects: getProjects(state),
    competitors: getCompetitors(state),
    competitor: getCompetitor(state, ownProps.params.competitorId),
  };
})
export default class Edit extends React.PureComponent {
  componentDidMount() {
    if(this.props.params.characterId && 'add' !== this.props.params.characterId){
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
      const {competitor, popup} = this.props
      if (popup.id != (competitor || {}).id) {
          this.props.dispatch({type: 'POPUP_UPDATED', payload: competitor})
      }
  }

  fetchData = () => {
      this.props.dispatch(fetchData({
          type: 'COMPETITOR',
          url: `/competitors/${this.props.params.competitorId}`,
      }));
  }

  handleSubmit = async () => {
    const { params } = this.props;
    const { title, description } = this.state;
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("group_id", params.groupId);

    let response
    if(params.characterId && 'add' !== params.characterId) {
      response = await api.put(`/competitors/${params.competitorId}`, formData);
    } else {
      response = await api.post(`/competitors`, formData);
    }

    if (!api.error(response)) {
      fn.navigate(`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}`);
    }
  };

  handleInputChange = (name, value) => this.setState({ [name]: value });

  render() {
    const { project, popup, params } = this.props;

    return (
      <ProjectWrapper {...this.props}>
        <Popup
            additionalClass={'groups wide'}
            title={popup.title ? `Group: ${popup.title}` : `New Competitor`}
            closePath={`/${url.projects}/${params.id}`}
            buttons={
              <React.Fragment>
                <Link to={`/${url.projects}/${this.props.params.id}/${url.groups}/${params.groupId}/${url.competitors}`}
                      className="button">Cancel</Link>
                <button type="button" className="button" onClick={() => this.form.submit()}>Submit</button>
              </React.Fragment>
            }
        >
            <Form onSubmit={this.handleSubmit} ref={el => (this.form = el)}>
              <TextInput
                name="title"
                label="Organisation's Name"
                validation="required"
                onChange={this.handleInputChange}
                value={popup.title}
                wide
              />

              <TextInput
                name="description"
                label="Notes"
                validation="required"
                onChange={this.handleInputChange}
                value={popup.description}
                textarea
                wide
              />
            </Form>
        </Popup>
      </ProjectWrapper>
    );
  }
}
