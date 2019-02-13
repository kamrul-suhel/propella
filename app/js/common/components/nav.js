import React from 'react';
import {Link, generatePath} from 'react-router';
import {connect} from 'react-redux';
import {fn} from 'app/utils';
import {Select} from '@xanda/react-components';
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector';
import {makeGetGroup} from 'app/containers/group/selector';

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    const getGroup = makeGetGroup();

    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class Popup extends React.PureComponent {

    nextLink = () => {
        const {params, location} = this.props

        if (location.pathname.match(/^\/projects\/[0-9]*\/groups/)) {
            return `/projects/${params.id}`
        } else if (location.pathname.match(/^\/projects\/[0-9]*/)) {
            return `/projects/${params.id}/groups`
        }
    }

    render() {
        const {project, location, group, groups, params} = this.props

        return (
            <div className="nav">
                {params.groupId ? (
                   // <Select
                     // name="group"
                      //value={params.groupId}
                    ///>
                    <span/>
                ) : (
                    <Link to={this.nextLink} className="icon-stack"/>
                )}
            </div>
        );
    }
}
