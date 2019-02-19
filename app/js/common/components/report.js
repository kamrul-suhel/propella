import React from 'react'
import {ContentLoader, Table} from "@xanda/react-components";
import {api} from 'app/utils';

export default class ReportList extends React.Component {

    handleReportExportCsv = async () => {
        // Check report type first
        let url = '';
        if (this.props.reportType === 'organisations') {
            url = `groups/${this.props.params.groupId}?format_type=csv`;
        } else {
            url = `groups/${this.props.params.groupId}/people?format_type=csv`;
        }
        const res = await api.get(url);

        const fileName = this.props.reportType === 'organisations' ? 'organisation-' : 'people-';
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

    getQuadrant = (collection) => {
        if (collection.positionX > 50) {
            if (collection.positionY > 50) {
                return 'VIP'
            } else {
                return 'STA'
            }
        } else {
            if (collection.positionY > 50) {
                return 'UP'
            } else {
                return 'NF'
            }
        }
    }

    render() {
        const {data, reportType} = this.props;

        const collections = reportType === 'organisations' ? data.organisations : data.people;

        return (
            <div className="report-component">
                <ContentLoader
                    data={collections}
                    isLoading={collections.isLoading}
                >
                    <Table headers={[
                        'Name',
                        'Organisation',
                        'Royalty',
                        'Loyalty',
                        'Quadrant',
                        'Character'
                    ]}>
                        {_.map(collections, (collection) => {
                            return (
                                <tr key={collection.id}>
                                    <td>{collection.title}</td>
                                    <td>{collection.organisation_title}</td>
                                    <td>{collection.positionX}</td>
                                    <td>{collection.positionY}</td>
                                    <td>{this.getQuadrant(collection)}</td>
                                    <td>{collection.icon_size}</td>
                                </tr>
                            )
                        })}
                    </Table>
                </ContentLoader>

                <div className="report-action">
                    <button onClick={this.handleReportExportCsv}>Create report</button>
                    <button onClick={this.handleReportPrint}>Print</button>
                </div>
            </div>
        )
    }
}