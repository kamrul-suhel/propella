import React from 'react';
import { connect } from 'react-redux';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';
import { api } from 'app/utils';
import { Link } from 'react-router';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { Nav } from 'app/components';
import { ContentLoader } from '@xanda/react-components';

@connect((state, ownProps) => {
	const getProjects = makeGetProjects();
	return {
		projects: getProjects(state)
	};
})
export default class List extends React.PureComponent {
        
        constructor(props){
            super(props);
            
            this.state = {
                selectedProject: 0
            }
        }

  componentDidMount() {
      this.fetchData();
  }

  fetchData = () => {
      this.props.dispatch(fetchData({
          type: 'PROJECT',
          url: `/projects`,
      }));
  }
  
  handleSelectProject = (projectId) => {
      this.setState({
          selectedProject: projectId
      })
  }

	render() {
    const { projects } = this.props
    const { selectedProject } = this.state
    
    console.log(selectedProject)

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
                      <h1 className="page-title">Your Propella projects</h1>
                  </div>

                  <div className="projects">
                      <div className="item-project new-project">
                          <div className="wrap">
                              <div className="thumb">
                                  <img src="http://propella.hostings.co.uk/wp-content/themes/propella/images/DottedStack.svg" alt=""/>
                              </div>
                          </div>
                          <h2 className="title"><Link to={`/${url.projects}/add`}>Add Project</Link></h2>
                          <a href="/onboarding.html" className="button-simple"><span className="icon-plus"></span></a>
                      </div>

                      {_.map(projects.collection, (item) => {
                        if(!item) return

                        return (
                          <div className="item-project">
                              <div className="wrap">
                                  <div className="thumb">
                                      <img src="http://propella.hostings.co.uk/wp-content/themes/propella/images/LayerGridStack.svg" alt=""/>
                                  </div>
                                  {selectedProject === item.id &&
                                        <ul className="project-menu">
                                            <li><a href="/project-page.html">Project mission</a></li>
                                            <li><Link to={`/${url.projects}/:id`}>Straight to project</Link></li>
                                            <li><a href="/archive.html">Project snapshot</a></li>
                                        </ul>
                                  }
                              </div>
                              <h2 className="title"><a href="#">{item.title}</a></h2>
                               <span className="clickable" className="button-simple menu-toggle icon-three-dots" onClick={() => this.handleSelectProject(item.id)}><span className="icon-options"></span></span>
                          </div>
                        )
                    })}
                  </div>

              </div>

          </div>
          {/*_.map(projects, (project) => <li>{project.ID}</li>)*/}
          </ContentLoader>
      </React.Fragment>
	   )
   }
}
