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


    handleReportExportCsv = async () => {
        const url = `groups/${this.props.params.groupId}?format_type=csv`;
        const res = await api.get(url);

        const fileName = 'organisation-';
        const linkUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = linkUrl;
        link.setAttribute('download', `${fileName}${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleReportPrint = () => {
        window.print();
    }

    getQuadrant = (people) => {
        if (people.positionX > 50) {
            if (people.positionY > 50) {
                return 'VIP'
            } else {
                return 'STA'
            }
        } else {
            if (people.positionY > 50) {
                return 'UP'
            } else {
                return 'NF'
            }
        }
    }

    render() {
        const {groups, group, params} = this.props

        return (
            <div className="report-page">
                <ContentLoader
                    data={groups.collection}
                    isLoading={groups.isLoading}
                >
                    {_.isEmpty(group.organisations) ? (
                        <h2>No organisation found</h2>
                    ) : (
                        <Table headers={[
                            'Name',
                            'Organisation',
                            'Royalty',
                            'Loyalty',
                            'Quadrant',
                            'Character'
                        ]}>
                            {_.map(group.organisations, (organisation) => {
                                return (
                                    <tr key={organisation.id}>
                                        <td>{organisation.title}</td>
                                        <td>{organisation.organisation_title}</td>
                                        <td>{organisation.positionX}</td>
                                        <td>{organisation.positionY}</td>
                                        <td>{this.getQuadrant(organisation)}</td>
                                        <td>{organisation.icon_size}</td>
                                    </tr>
                                )
                            })}
                        </Table>
                    )}
                </ContentLoader>

                <div className="report-action">
                    <button onClick={this.handleReportExportCsv}>Create report</button>
                    <button onClick={this.handleReportPrint}>Print</button>
                </div>
            </div>
        );
    }
}
