import React from "react";
import { connect } from "react-redux";
import {
  makeGetProject,
  makeGetProjects
} from "app/containers/project/selector";
import { api } from "app/utils";
import { Link } from "react-router";
import { url } from "app/constants";
import { fetchData } from "app/actions";
import { Nav } from "app/components";
import { ContentLoader } from "@xanda/react-components";

@connect((state, ownProps) => {
  const getProjects = makeGetProjects();
  return {
    projects: getProjects(state)
  };
})
export default class List extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedProject: 0
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.props.dispatch(
      fetchData({
        type: "PROJECT",
        url: `/projects`
      })
    );
  };

  handleSelectProject = projectId => {
    // switch to 0 to hide the menu if already selected
    projectId = (this.state.selectedProject == projectId) ? 0 : projectId
    this.setState({
      selectedProject: projectId
    });
  };

  handleSnapshotProject = async projectId => {
    const response = await api.get(`projects/${projectId}/archives`)

    if(!api.error(response)){
      console.log("Project archive :", response);

      this.fetchData();
    }
  }

  handleDeleteProject = async projectId => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const response = await api.delete(`projects/${projectId}`)
      if (!api.error(response)) {
        this.props.dispatch({type: 'PROJECT_DELETED', payload: response.data})
      }
    }
  }

  render() {
    const { projects } = this.props;
    const { selectedProject } = this.state;

    return (
      <React.Fragment>
        <Nav {...this.props} />
        <ContentLoader
          data={projects.collection}
          isLoading={projects.isLoading}
        >
          <div className="centering project">
            <div className="page-wrap">
              <div className="page-header">
                <h1 className="page-title">Your Propella Projects</h1>
              </div>

              <div className="projects">
                <div className="item-project new-project">
                  <div className="wrap">
                    <div className="thumb">
                      <Link to={`/${url.projects}/add`}>
                        <img
                          src="http://propella.hostings.co.uk/wp-content/themes/propella/images/DottedStack.svg"
                          alt=""
                        />
                      </Link>
                    </div>
                  </div>
                  <h2 className="title">
                    <Link to={`/${url.projects}/add`}>Add Project</Link>
                  </h2>
                  <a href="/onboarding.html" className="button-simple">
                    <span className="icon-plus" />
                  </a>
                </div>

                {_.map(projects.currentCollection, itemId => {
                  const item = projects.collection[itemId]
                  if (!item) return;

                  return (
                    <div className="item-project">
                      <div className="wrap">
                        <div className="thumb">
                          <Link to={`/${url.projects}/${item.id}`}>
                            <img
                              src="../../images/LayerGridStackBig.svg"
                              alt=""
                            />
                          </Link>
                        </div>
                        {selectedProject === item.id && (
                          <ul className="project-menu">
                            <li key="edit">
                              <Link to={`/${url.projects}/${item.id}/edit`}>
                                Project mission
                              </Link>
                            </li>
                            <li key="view">
                              <Link to={`/${url.projects}/${item.id}`}>
                                Straight to project
                              </Link>
                            </li>
                            <li key="archive">
                              <span className="clickable" onClick={() => this.handleSnapshotProject(item.id)}>Project snapshot</span>
                            </li>
                            <li key="delete">
                              <span className="clickable" onClick={() => this.handleDeleteProject(item.id)}>Delete project</span>
                            </li>
                          </ul>
                        )}
                      </div>
                      <h2 className="title">{item.title}</h2>
                      <span                        
                        className={`clickable button-simple menu-toggle icon-three-dots ${selectedProject === item.id && "three-dots-active"}`}
                        onClick={() => this.handleSelectProject(item.id)}
                      >
                        <span className="icon-options" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ContentLoader>
      </React.Fragment>
    );
  }
}
