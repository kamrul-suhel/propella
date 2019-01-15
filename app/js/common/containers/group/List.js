import React from 'react';
import { Link } from 'react-router';
import { fetchData } from 'app/actions';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import { Popup } from 'app/components';
import { url } from 'app/constants';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';

@connect((state, ownProps) => {
	const getProjects = makeGetProjects();
	const getProject = makeGetProject();
	return {
		projects: getProjects(state),
		project: getProject(state, ownProps.params.id),
	};
})
export default class List extends React.PureComponent {
	componentDidMount() {
		this.fetchData();
	}

	fetchData = () => {
		this.props.dispatch(fetchData({
			type: 'PROJECT',
			url: `/projects/${this.props.params.id}`,
		}));
	}

	render() {

		const { project } = this.props

		return (
			<Popup
				title="Groups"
				closePath={`/${url.projects}/${this.props.params.id}`}
			>
				{_.isEmpty(project.groups) ? (
					<Link to={`/${url.projects}/${this.props.params.id}/${url.groups}/add`}>Add your first group <i dangerouslySetInnerHTML={{__html: `&plus;`}} /></Link>
				) : (
					<React.Fragment>
						<ul>
							{_.map(project.groups, (group) => {
								return <li>{group.title}</li>
							})}
						</ul>
						<Link to={`/${url.projects}/${this.props.params.id}/${url.groups}/add`}>Add group</Link>
					</React.Fragment>
				)}
			</Popup>
		);
	}
}
