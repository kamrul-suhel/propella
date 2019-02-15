import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {api} from 'app/utils';
import * as selector from './selector';
import {Link} from "react-router";

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId)
    };
})
export default class Wrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            clickOutSide: false,
            progressLabel: 'Progress'
        }
    }

    componentDidMount() {
        if ('add' !== this.props.route.type) {
            this.fetchData();
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'GROUP',
            url: `/groups/${this.props.params.groupId}`,
        }));
    }

    onDraggableEventHandler = (event, data) => {
        // find the id we're moving
        const organisationId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        console.log('handle id ', organisationId);

        console.log('Delta is: ', data);

        if (data.deltaX === 0 || data.deltaY === 0) {
            this.setState({'selectedDraggable': organisationId, clickOutSide: false})
        } else {
            // get the wrapper dimensions
            const maxWidth = data.node.parentNode.clientWidth
            const maxHeight = data.node.parentNode.clientHeight

            const newY = _.round((data.y / maxHeight) * 100, 4)
            const newX = _.round((data.x / maxWidth) * 100, 4)

            this.setState({
                updatedCoordinates: {
                    ...this.state.updatedCoordinates,
                    [organisationId]: {id: organisationId, positionX: newX, positionY: newY}
                }
            })
        }
    }

    handleClickInside = (e, organisationId) => {
        const click = !this.state.clickOutSide;
        this.setState({
            selectedGroupCoordinates: {}
        });

        if (organisationId === this.state.selectedDraggable) {
            this.setState({
                clickOutSide: click,
                progressLabel: 'Progress'
            })
        }
    }

    handleSaveChanges = async () => {
        const {updatedCoordinates} = this.state

        const response = await api.put(`/organisations`, {organisations: _.values(updatedCoordinates)})
        if (!api.error(response)) {
            // if successfull remove from pending updates
            this.setState({'updatedCoordinates': {}})
        }
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }

    render() {
        const {groups, group, params} = this.props
        const {updatedCoordinates, handleClickInside, selectedDraggable, clickOutSide, progressLabel} = this.state

        const childrenWithProps = React.Children.map(this.props.children, child => React.cloneElement(child, ...this.props));

        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0

        return (
            <React.Fragment>
                {!_.isEmpty(updatedCoordinates) &&
                <React.Fragment>
                    <button className="button gridwrapper-save" onClick={this.handleSaveChanges}>Save Changes</button>
                </React.Fragment>
                }
                {_.map(group.organisations, (organisation) => {
                    if (organisation.status < 1) {
                        return
                    }
                    return (
                        <Draggable
                            key={organisation.id}
                            axis="both"
                            handle=".handle"
                            defaultPosition={{
                                x: containerWidth / 100 * organisation.positionX,
                                y: containerHeight / 100 * organisation.positionY
                            }}
                            grid={[10, 10]}
                            scale={1}
                            bounds=".gridwrapper-inner-section-wrapper"
                            onStop={this.onDraggableEventHandler}
                        >
                            <div handleid={organisation.id}
                                 className={`size-${organisation.icon_size}`}
                                 onClick={(event) => this.handleClickInside(event, organisation.id)}
                            >
                                <div className="handle">{organisation.abbreviation}</div>

                                {selectedDraggable === organisation.id && clickOutSide &&
                                    <div className="react-draggable-actions">
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${organisation.id}`}>
                                            <span className="button-round-inside icon-edit"/>
                                            Edit
                                        </Link>

                                        <span className="button-round second"
                                              onClick={(event) => this.getGroupCoordinate(event, group.id)}>
                                            <span className="button-round-inside icon-chain"/>{progressLabel}
                                        </span>

                                        <Link className="button-round third"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/`}>
                                            <span className="button-round-inside icon-add-organisation"/>
                                            People
                                        </Link>

                                        <Link className="button-round fourth"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/competitors`}>
                                            <span className="button-round-inside"/>
                                            Add Person
                                        </Link>
                                    </div>
                                }

                            </div>
                        </Draggable>
                    )
                })
                }
                {childrenWithProps}
            </React.Fragment>
        )
    }
}
