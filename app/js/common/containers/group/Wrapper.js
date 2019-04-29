import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {api, fn} from 'app/utils';
import * as selector from './selector';
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector';
import {Link} from "react-router";
import Coordinate from 'app/components/coordinate'
import {ContentLoader} from '@xanda/react-components';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
        draggedOrganisations: state.draggedOrganisations
    };
})
export default class GroupWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedDraggable: 0,
            selectedCompetitor: 0,
            selectedOrganisation: {},
            actionPositionClass:''
        }
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false)
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
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
        }));
    }

    onDraggableEventHandler = (event, data) => {
        const {
            location,
            group,
            draggedOrganisations,
            dispatch
        } = this.props

        // find the id we're moving
        const organisationId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            const actionPositionClass = fn.getDraggableActionClass({positionX: data.x, positionY: data.y})
            this.setState({'selectedDraggable': organisationId, actionPositionClass: actionPositionClass})
        } else {
            let organisation = _.find(group.organisations, (organisation)=>{
                return organisation.id === organisationId
            })
            const position = fn.getPositionForSave(data, location, organisation.icon_size)

            // put dragged item into store
            let selectedOrganisations =  [...draggedOrganisations.organisations]

            _.remove(selectedOrganisations, (curOrganisation)=> curOrganisation.id === organisation.id)
            organisation.positionX = position.positionX
            organisation.positionY = position.positionY
            selectedOrganisations.push(organisation);
            dispatch({
                type:'DRAGGED_ORGANISATION_UPDATE',
                payload:selectedOrganisations
            })
        }
    }

    handleSaveChanges = async () => {
        const {
            dispatch,
            draggedOrganisations
        } = this.props

        const saveOrganisations = [...draggedOrganisations.organisations]

        const response = await api.put(`/organisations`, {organisations: saveOrganisations})
        if (!api.error(response)) {

            this.fetchData();

            // Clear dragged group
            dispatch({
                type:'DRAGGED_ORGANISATION_CLEAR'
            });
        }
    }

    getCoordinate = async (event, organisationId) => {
        const {
            selectedOrganisation
        } = this.state

        const { draggedOrganisations } = this.props

        if (!_.isEmpty(selectedOrganisation)) {
            this.setState({selectedOrganisation: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            // Get the data from server
            const data = await api.get('organisations/' + organisationId);
            let selectedOrganisation = {...data.data};
            _.map(draggedOrganisations.organisations, (updatedCoordinate) => {
                if (updatedCoordinate.id === selectedOrganisation.id) {
                    selectedOrganisation.positionX = updatedCoordinate.positionX;
                    selectedOrganisation.positionY = updatedCoordinate.positionY;
                }
            });

            if (selectedOrganisation) {
                this.setState({
                    selectedOrganisation: {...selectedOrganisation}
                })
            }
        }
    }

    handleClick = (e) => {
        if (this.node) {
            if (!this.node.contains(e.target)) {
                this.setState({selectedDraggable: 0, selectedOrganisation: {}, selectedCompetitor: 0})
            }
        }
    }

    handleSetTrajectory = async (organisation) => {
        const {params} = this.props
        const newTrajectory = fn.getTrajectory(organisation.trajectory);
        const response = await api.put(`organisations/${organisation.id}`, {trajectory: newTrajectory});

        this.props.dispatch(
            {
                type: 'GROUP_ORGANISATION_UPDATED',
                payload: {
                    'groupId': params.groupId,
                    'organisation': response.data
                }
            }
        )
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }

    handleSelectCompetitor = (id) => this.setState({selectedCompetitor: id})

    render() {
        const {
            groups,
            group,
            params,
            container,
            location,
            draggedOrganisations
        } = this.props
        const {
            selectedDraggable,
            selectedOrganisation,
            selectedCompetitor,
            actionPositionClass,

        } = this.state

        const organisations = fn.getAllSortedItem(group.organisations, draggedOrganisations.organisations);

        // dont load unless we have the container's dimensions
        if (!container) {
            return null
        }

        return (
            <div ref={node => this.node = node}>
                <ContentLoader
                    data={groups.collection}
                    isLoading={groups.isLoading}
                >
                    {_.map(group.competitors, (item, i) => {
                        let positionClass
                        switch (i) {
                            case 0:
                                positionClass = 'left'
                                break;
                            case 1:
                                positionClass = 'bottom'
                                break;
                            case 2:
                                positionClass = 'right'
                                break;
                        }
                        return (
                            <div className={`competitor ${positionClass}`}
                                 key={item.id}
                                 onClick={() => this.handleSelectCompetitor(item.id)}>
                                {selectedCompetitor === item.id &&
                                <div className="competitor-tooltip">
                                    <div className="competitor-tooltip-header">{item.title}</div>
                                    <div className="competitor-tooltip-inner">
                                        <Link
                                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}/${item.id}`}>Edit</Link>
                                    </div>
                                </div>
                                }
                            </div>
                        )
                    })}

                    {_.map(organisations, (item) => {
                        if (item.status < 1) {
                            return
                        }

                        const isShow = fn.isItemShow(item, location);
                        if (!isShow) {
                            return;
                        }

                        const position = fn.getPosition(item, location);
                        const trajectoryClass = fn.getTrajectoryClass(item.trajectory);

                        return (
                            <Draggable
                                key={item.id}
                                axis="both"
                                handle=".react-draggable-handle"
                                defaultPosition={{
                                    x: position.positionX,
                                    y: position.positionY
                                }}
                                grid={[10, 10]}
                                scale={1}
                                bounds=".gridwrapper-inner-section-wrapper"
                                onStop={this.onDraggableEventHandler}
                            >
                                <div handleid={item.id}
                                     className={
                                         [
                                             `size-${item.icon_size}`,
                                             `trajectory-${trajectoryClass}`,
                                             (selectedDraggable && selectedDraggable !== item.id ? 'disabled' : ''),
                                             (selectedDraggable === item.id ? 'is-selected' : '')
                                         ]
                                     }
                                >
                                    <div className="react-draggable-handle">
                                        <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                        <span className="user-colour-dot"
                                              style={{backgroundColor: item.profile_colour}}></span>
                                    </div>
                                    {selectedDraggable === item.id &&
                                    <span className="react-draggable-title">{item.title}</span>
                                    }

                                    {selectedDraggable === item.id &&
                                    <div className={`react-draggable-actions ${actionPositionClass}`}>
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}`}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        {item.coordinates && item.coordinates.length > 0 ? (
                                            <span className="clickable button-round second"
                                                  onClick={(event) => this.getCoordinate(event, item.id)}>
                                            <span
                                                className="button-round-inside icon-chain"/>{_.isEmpty(selectedOrganisation) ? 'Progress' : 'Hide Progress'}
                                        </span>
                                        ) : (
                                            <span className="button-round second progress-hide">
                                            <span className="button-round-inside icon-chain"/>Progress
                                        </span>
                                        )}

                                        <Link className="button-round third"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${url.people}`}>
                                            <span className="button-round-inside icon-add-organisation"/>
                                            People
                                        </Link>

                                        <span className="button-round fourth clickable"
                                              onClick={() => {
                                                  this.handleSetTrajectory(item)
                                              }}>
                                            <span className="button-round-inside icon-compass"/>
                                            Choose<br/>Trajectory
                                        </span>
                                    </div>
                                    }

                                </div>
                            </Draggable>
                        )
                    })
                    }

                    {this.props.children}

                    {selectedOrganisation.coordinates && !fn.isZoom(location) ? <Coordinate {...this.props} group={selectedOrganisation}/> : ''}

                    { draggedOrganisations.updatedOrganisation &&
                        <button className="button gridwrapper-save"
                                onClick={this.handleSaveChanges}>Save Changes
                        </button>
                    }
                </ContentLoader>
            </div>
        )
    }
}
