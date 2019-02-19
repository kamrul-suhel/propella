import React from 'react';
import {connect} from 'react-redux';
import {ReportList} from 'app/components';
import {makeGetGroup, makeGetGroups} from 'app/containers/group/selector';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class Report extends React.PureComponent {

    render() {
        const {group, params} = this.props

        return (
            (_.isEmpty(group.organisations) ? (
                    <h2>No organisation found</h2>
                ) : (
                    <ReportList
                        reportType="organisations"
                        data={group}
                        params={params}/>
                ))
        );
    }
}
