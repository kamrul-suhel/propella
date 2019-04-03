import React from "react";
import { connect } from "react-redux";
import { ReportList } from "app/components";
import { fetchData } from "app/actions";
import { makeGetGroup, makeGetGroups } from "app/containers/group/selector";
import { Nav } from "app/components";
import { fn } from "app/utils";
import {ContentLoader, Table} from '@xanda/react-components';

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
    const { groups, group, params } = this.props;

    return (
      <React.Fragment>
        <Nav {...this.props} />
        {_.isEmpty(groups.collection) ? (
          <div className="report-component">
               <h1>No organisations found</h1>
           </div>
        ) : (
          <div className="report-component">
              <ContentLoader
                  data={groups.collection}
                  isLoading={groups.isLoading}
              >
              <h1>Data visual: Organisations</h1>
                  <Table headers={[
                      'Name',
                      'Royalty',
                      'Loyalty',
                      'Quadrant'
                  ]}>
                      {_.map(group.organisations, (collection) => {
                          return (
                              <tr key={collection.id}>
                                  <td>{collection.title}</td>
                                  <td>{collection.positionX}</td>
                                  <td>{collection.positionY}</td>
                                  <td>{fn.getQuadrant(collection.positionX, collection.positionY)}</td>
                              </tr>
                          )
                      })}
                  </Table>
              </ContentLoader>

              <div className="report-action">
                  <button onClick={() =>
                      fn.downloadAttachment(`groups/${this.props.params.groupId}?format_type=csv`, 'export-organisations.csv')}>Create report
                  </button>

                  <button onClick={fn.handleReportPrint}>Print</button>
              </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
