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
        url: `/projects/`
      })
    );
  };

  render() {
    const { projects } = this.props;

    return (
      <React.Fragment>
        <Nav {...this.props} />
        <ContentLoader
          data={projects.collection}
          isLoading={projects.isLoading}
        >
          <div className="centering">
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

                    <div className="revisions">
                      <div className="revision">
                        <div className="date">
                          Tuesday 24th February 2017, 12:34pm
                        </div>
                        <div className="actions">
                          <a href="#">
                            <span className="icon-eye" />
                            View
                          </a>
                          <a href="#">
                            <span className="icon-bin" />
                            Delete
                          </a>
                        </div>
                      </div>
                    </div>
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
