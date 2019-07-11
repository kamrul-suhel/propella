import React from "react";
import {connect} from "react-redux";
import {fetchData} from "app/actions";
import {makeGetGroup, makeGetGroups} from "app/containers/group/selector";
import {makeGetProject} from 'app/containers/project/selector'
import {Nav} from "app/components";
import {fn} from "app/utils";
import {ContentLoader, Table} from '@xanda/react-components';

import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";

@connect((state, ownProps) => {
    const getGroups = makeGetGroups()
    const getGroup = makeGetGroup()
    const getProject = makeGetProject()
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        project: getProject(state, ownProps.params.id)
    };
})
export default class Report extends React.PureComponent {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const html = fn.getRootElementForLock()
        enableBodyScroll(html)
        this.fetchData();
    }

    componentWillUnmount() {
        const html = fn.getRootElementForLock()
        disableBodyScroll(html)
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
        const {
            groups,
            group,
            params,
            project
        } = this.props;

        return (
            <React.Fragment>
                <Nav {...this.props} />
                {_.isEmpty(groups.collection) ? (
                    <div className="report-component" id="report-component">
                        <h1>No people found</h1>
                    </div>
                ) : (
                    <div className="report-component" id="report-component">
                        <ContentLoader
                            data={groups.collection}
                            isLoading={groups.isLoading}
                        >
                            <h3>Project: {project.title}</h3>
                            <h3>Data visual: People</h3>
                            <Table headers={[
                                'Name',
                                'Organisation',
                                'Loyalty',
                                'Royalty',
                                'Quadrant',
                                'Character'
                            ]}>
                                {_.map(group.people, (collection) => {
                                    const character = fn.getPeopleCharacter(collection.character_id)
                                    return (
                                        <tr key={collection.id}>
                                            <td>{collection.title}</td>
                                            <td>{collection.organisation_title}</td>
                                            <td>{fn.convertFloatToInt(collection.positionX)}</td>
                                            <td>{fn.convertFloatToInt(collection.positionY)}</td>
                                            <td>{fn.getQuadrant(collection.positionX, collection.positionY)}</td>
                                            <td>{character.title}</td>
                                        </tr>
                                    )
                                })}
                            </Table>
                        </ContentLoader>

                        <div className="report-action">
                            <button onClick={() =>
                                fn.downloadAttachment(`groups/${this.props.params.groupId}/people?format_type=csv`, 'export-people.csv')}>Create
                                report
                            </button>

                            <button onClick={fn.handleReportPrint}>Print</button>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}
