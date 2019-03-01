import React from "react";
import { connect } from "react-redux";
import { ReportList } from "app/components";
import { fetchData } from "app/actions";
import { makeGetGroup, makeGetGroups } from "app/containers/group/selector";
import { Nav } from "app/components";

@connect((state, ownProps) => {
  const getGroups = makeGetGroups();
  const getGroup = makeGetGroup();
  return {
    groups: getGroups(state),
    group: getGroup(state, ownProps.params.groupId)
  };
})
export default class Report extends React.PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.props.dispatch(
      fetchData({
        type: "GROUP",
        url: `/groups/${this.props.params.groupId}`
      })
    );
  };

  handleReportPrint = () => {
    window.print();
  };

  render() {
    const { group, params } = this.props;

    return (
      <React.Fragment>
        <Nav {...this.props} />
        {_.isEmpty(group.organisations) ? (
          <div className="report-component">
               <h1>No organisation found</h1>
           </div>
        ) : (
          <ReportList
            title="Data visual: People"
            reportType="people"
            data={group}
            params={params}
          />
        )}
      </React.Fragment>
    );
  }
}
