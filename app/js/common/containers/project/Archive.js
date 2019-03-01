import React from "react";
import { fetchData } from "app/actions";
import { connect } from "react-redux";
import { Link } from "react-router";
import { url } from "app/constants";
import { api, fn } from "app/utils";
import { Nav } from "app/components";
import * as selector from "./selector";
import { Form, TextInput, ContentLoader } from "@xanda/react-components";

@connect((state, ownProps) => {
  const getProjects = selector.makeGetProjects();

  return {
    projects: getProjects(state)
  };
})
export default class Edit extends React.PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.props.dispatch(
      fetchData({
        type: "PROJECT",
        url: `/projects/?archives=1`
      })
    );
  };

  handleDeleteArchive = async (id) => {
    if (window.confirm("Are you sure you want to delete this archive?")) {
        const response = await api.delete(`projects/${id}`)
        if (!api.error(response)) {
            this.fetchData()
        }
    }
  }

  render() {
    const { projects } = this.props;

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
                <h1 className="page-title">Archive</h1>
              </div>

              <div className="archive">
                {_.map(projects.collection, project => (
                  <div className="item-archive">
                    <div className="thumb">
                      <img src="../../../images/GreyscaleStack.svg" alt="" />
                    </div>

                    <div className="summary">
                      <h2 className="title">{project.title}</h2>
                      <p>{project.description}</p>
                      <Link
                        to={`/${url.projects}/${project.id}`}
                        className="button-simple button-small"
                      >
                        <span className="icon-eye" />
                        View Current Model
                      </Link>
                    </div>

                    {!_.isEmpty(project.archives) && (
                      <div className="revisions">
                        {_.map(project.archives, (archive) => (
                          <div className="revision">
                            <div className="date">
                              {archive.updated_at}
                            </div>
                            <div className="actions">
                              <Link to={`/${url.projects}/${archive.id}`}>
                                <span className="icon-eye" />
                                View
                              </Link>
                              <span className="clickable" onClick={() => this.handleDeleteArchive(archive.id)}>
                                <span className="icon-bin" />
                                Delete
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentLoader>
      </React.Fragment>
    );
  }
}
