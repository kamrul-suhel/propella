import React from 'react';
import { connect } from 'react-redux';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';

@connect((state, ownProps) => {
	const getProjects = makeGetProjects();
	const getProject = makeGetProject();
	return {
		projects: getProjects(state),
		project: getProject(state, ownProps.params.id),
	};
})
export default class View extends React.PureComponent {
	render() {
    const { project } = this.props

		return (
      <React.Fragment>
        {_.isEmpty(project.groups) &&
          <div class="welcome-message">
            <div class="welcome-message-inner">
                <h2>Welcome to your grid</h2>
                <p>Click the menu above to start plotting your groups.</p>
            </div>
          </div>
        }
      </React.Fragment>
	   )
   }
}
