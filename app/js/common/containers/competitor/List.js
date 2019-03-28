import React from "react";
import { Link } from "react-router";
import { fetchData } from "app/actions";
import { connect } from "react-redux";
import {
  ContentLoader,
  Form,
  Repeater,
  Accordion,
  TextInput
} from "@xanda/react-components";
import { Popup, FancyList, FancyListItem } from "app/components";
import { api } from "app/utils";
import { url } from "app/constants";
import * as selector from "./selector";
import { makeGetProjects } from "app/containers/project/selector";
import { makeGetProjectGroups, makeGetProjectGroup } from "app/containers/group/selector";
import { ProjectWrapper } from "app/containers/project";

@connect((state, ownProps) => {
  const getProjects = makeGetProjects();
  const getGroups = makeGetProjectGroups();
  const getGroup = makeGetProjectGroup();
  const getCompetitors = selector.makeGetCompetitors();

  return {
    competitors: getCompetitors(state),
    projects: getProjects(state),
    groups: getGroups(state, ownProps.params.id),
    group: getGroup(state, ownProps.params.id, ownProps.params.groupId),
  };
})
export default class List extends React.PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.props.dispatch(
      fetchData({
        type: "COMPETITOR",
        url: `/groups/${this.props.params.groupId}/competitors`
      })
    );
  };

  handleSubmit = async () => {
    const { params } = this.props;
    const { competitors, competitorsRemoved } = this.state;

    if (!_.isEmpty(competitors)) {
      const formData = new FormData();
      _.map(competitors, (competitor, i) => {
        // only add the id if its an existing item
        if (0 !== competitor.id) {
          formData.append(`competitors[${i}][id]`, competitor.id);
        }

        formData.append(`competitors[${i}][title]`, competitor.title);
        const competitorDescription = (competitor.description) ? competitor.description : ''
        formData.append(`competitors[${i}][description]`, competitorDescription);
      });

      _.map(competitorsRemoved, id =>
        formData.append(`competitors[deleted][${id}]`, id)
      );

      const response = await api.put(`/groups/${params.groupId}`, formData);

      if (!api.error(response)) {
        this.fetchData();
      }
    }
  };

  handleInputChange = (name, value) => this.setState({ [name]: value });

  handleRemoved = item => {
    // dont record new items
    if (0 !== item.id) {
      this.setState({ competitorsRemoved: [...this.state, item.id] });
    }
  };

  handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this competitor?")) {
      const response = await api.delete(`competitors/${id}`)
      if (!api.error(response)) {
        this.props.dispatch({type: 'COMPETITOR_DELETED', payload: response.data})
      }
    }
  }

  renderItem = item => {
    const { params } = this.props

    return (
      <FancyListItem
          key={item.id}
          keyId={item.id}
          actions={
              <React.Fragment>
                  <Link
                    to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}/${item.id}`}
                    className="icon-pencil"
                  />
                  <span onClick={() => this.handleDelete(item.id)} className="clickable icon-bin"/>
              </React.Fragment>
          }
      >
          {item.title}
      </FancyListItem>
    )
  }

  render() {
    const { competitors, params, projects, group } = this.props;

    return (
      <ProjectWrapper {...this.props}>
        <ContentLoader
          data={projects.collection}
          isLoading={projects.isLoading}
        >
          <Popup
            title={`${group.title}'s Competitors`}
            closePath={`/${url.projects}/${this.props.params.id}`}
            buttons={
              <React.Fragment>
                {!_.isEmpty(competitors.currentCollection) && competitors.currentCollection.length < 3 &&
                  <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}/add`} className="button">
                    Add competitor
                  </Link>
                }
              </React.Fragment>
            }
            additionalClass="competitors wide"
          >
            <ContentLoader
              data={competitors.collection}
              isLoading={competitors.isLoading}
            >
              {_.isEmpty(competitors.collection) ? (
                  <Link className="button" to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}/add`}>Add your first
                      competitor <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
              ) : (
                <FancyList>
                  {_.map(competitors.currentCollection, (id) => {
                    const item  = competitors.collection[id]
                    if(!item){
                      return
                    }
                    return this.renderItem(item)
                  })}
                </FancyList>
              )}
            </ContentLoader>
          </Popup>
        </ContentLoader>
      </ProjectWrapper>
    );
  }
}
