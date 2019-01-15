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
			_.map(project.groups, (group) => {
				const coordinate = group.coordinates[0] //get the latest one
				return (
						<Draggable
					        axis="both"
					        handle=".handle"
					        defaultPosition={{x: coordinate.position_x, y: coordinate.position_y}}
					        grid={[10, 10]}
					        scale={1}>
						<div>
							<div className="handle">{group.title}</div>
						</div>
				    </Draggable>
				)
			})
		);
	}
}
