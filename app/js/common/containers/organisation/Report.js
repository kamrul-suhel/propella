import React from 'react';
import { connect } from 'react-redux';
import { fetchData } from 'app/actions';
import { ReportList } from 'app/components';
import { makeGetGroup, makeGetGroups } from 'app/containers/group/selector';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class Report extends React.PureComponent {
  componentDidMount() {
      this.fetchData();
  }

  fetchData = () => {
      this.props.dispatch(fetchData({
          type: 'GROUP',
          url: `/groups/${this.props.params.groupId}`,
      }));
  }

    handleReportPrint = () => {
        window.print();
    }
    render() {
        const {group, params} = this.props

        const downloadUrl = `groups/${this.props.params.groupId}?format_type=csv`;

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
