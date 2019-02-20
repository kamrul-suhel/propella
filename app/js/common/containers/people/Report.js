import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader, Table} from '@xanda/react-components';
import {FancyList, FancyListItem, Popup} from 'app/components';
import {api, fn} from 'app/utils';
import {url} from 'app/constants';
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
        const {groups, group, params} = this.props

        const downloadUrl = `groups/${this.props.params.groupId}/people?format_type=csv`;

        return (
            <div className="report-page">
                <ContentLoader
                    data={groups.collection}
                    isLoading={groups.isLoading}
                >
                    {_.isEmpty(group.people) ? (
                        <h2>No people found</h2>
                    ) : (
                        <Table headers={[
                            'Name',
                            'Organisation',
                            'Royalty',
                            'Loyalty',
                            'Quadrant',
                            'Character'
                        ]}>
                            {_.map(group.people, (people) => {
                                return (
                                    <tr key={people.id}>
                                        <td>{people.title}</td>
                                        <td>{people.organisation_title}</td>
                                        <td>{people.positionX}</td>
                                        <td>{people.positionY}</td>
                                        <td>{fn.getQuadrant(people.positionX, people.positionY)}</td>
                                        <td>{people.icon_size}</td>
                                    </tr>
                                )
                            })}
                        </Table>
                    )}
                </ContentLoader>

                <div className="report-action">
                    <button onClick={() => fn.downloadAttachment(downloadUrl, 'people-export')}>Create report</button>
                    <button onClick={this.handleReportPrint}>Print</button>
                </div>
            </div>
        );
    }
}
