import React from 'react'
import {url} from 'app/constants'
import {fetchData} from 'app/actions'
import {connect} from 'react-redux'
import Draggable from 'react-draggable'
import {api, fn} from 'app/utils'
import * as selector from './selector'
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector'
import {Link} from "react-router"
import Coordinate from 'app/components/coordinate'
import {ContentLoader} from '@xanda/react-components'
import ReactFitText from 'react-fittext'

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id)
    };
})
export default class GroupWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedDraggable: 0,
            selectedCompetitor: 0,
            selectedOrganisation: {},
            actionPositionClass: '',
            showSelectedClusterItem: null,
            selectedCluster: []
        }
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false)
        document.addEventListener('touchstart', this.handleClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false)
        document.removeEventListener('touchstart', this.handleClick, false)
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
            groupId: this.props.params.groupId
        }));

        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
            projectId: this.props.params.id
        }));
    }

    onDraggableEventHandler = (event, data) => {
        const {
            location,
            group,
            dispatch,
            params
        } = this.props

        // find the id we're moving
        const organisationId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            const actionPositionClass = fn.getDraggableActionClass({positionX: data.x, positionY: data.y})
            this.setState({
                selectedDraggable: organisationId,
                actionPositionClass: actionPositionClass
            })
        } else {
            // find the organisation
            let organisation = _.find(group.organisations, (organisation) => {
                return organisation.id === organisationId
            })
            const position = fn.getPositionForSave(data, location, organisation.icon_size)

            // put dragged item into store
            organisation.positionX = position.positionX
            organisation.positionY = position.positionY

            dispatch({
                type: 'DRAGGED_ORGANISATION_UPDATE',
                payload: {
                    groupId: params.groupId,
                    organisation: organisation
                }
            })
        }
    }

    handleSaveChanges = async () => {
        const {
            dispatch,
            groups,
            group,
            params
        } = this.props

        const updatedOrganisationIds = [...groups.updatedOrganisations];
        let selectedOrganisations = [];
        _.map(updatedOrganisationIds, (id) => {
            const organisation = _.find(group.organisations, (o) => {
                if (o.id === id) {
                    return o;
                }
            })

            let newOrganisation = {
                id: organisation.id,
                positionX: organisation.positionX,
                positionY: organisation.positionY
            }

            selectedOrganisations.push(newOrganisation)
        })

        const response = await api.put(`/organisations`, {organisations: selectedOrganisations})
        if (!api.error(response)) {
            // Clear dragged organisation
            dispatch({
                type: 'DRAGGED_ORGANISATION_CLEAR'
            });

            dispatch({
                type: 'CLEAR_UPDATED_GROUP'
            });

            dispatch({
                type: 'ORGANISATION_CLEAR'
            });

            this.fetchData();
        }
    }

    onHandleClusterEvent = (event, data) => {
        // find the id we're moving
        const clusterIds = _.split(_.find(data.node.attributes, {name: 'handleid'}).value, ',')
        const actionPositionClass = fn.getClusterItemsPositionClass({positionX: data.x, positionY: data.y})

        this.setState({
            selectedCluster: clusterIds,
            showSelectedClusterItem: null,
            actionPositionClass: actionPositionClass
        })
    }

    handleClusterItem = (organisation) => {
        const {location} = this.props
        const selectedOrganisation = fn.getPosition(organisation, location)
        const actionPositionClass = fn.getDraggableActionClass({
            positionX: selectedOrganisation.positionX,
            positionY: selectedOrganisation.positionY
        })
        this.setState({
            selectedCluster: [],
            showSelectedClusterItem: organisation.id,
            selectedDraggable: organisation.id,
            actionPositionClass: actionPositionClass
        })
    }

    renderCurrentClusterItems = (ids) => {
        const {group} = this.props

        //get all groups
        let currentOrganisations = [];
        _.map(ids, (id) => {
            _.map(group.organisations, (organisation) => {
                if (parseInt(id) === organisation.id) {
                    currentOrganisations.push(organisation)
                }
            })
        })

        return (
            <div className={`cluster-items`}>
                <div className={'cluster-body'}>
                    <div className={'cluster-body-inner'}>
                        {
                            _.map(currentOrganisations, (organisation) => {
                                return (
                                    <div
                                        key={organisation.id}
                                        className="size-m icon_size"
                                        onClick={() => this.handleClusterItem(organisation)}
                                    >
                                        <div className="react-draggable-handle">
                                            {organisation.icon_path ? (
                                                <img className="react-draggable-handle-icon"
                                                     src={`${organisation.icon_path}`}/>
                                            ) : (
                                                <ReactFitText compressor={.6}>
                                                    <div
                                                        className="react-draggable-handle-title">{organisation.abbreviation}</div>
                                                </ReactFitText>
                                            )}
                                            <span className="user-colour-dot"
                                                  style={{backgroundColor: organisation.profile_colour}}></span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    getCoordinate = async (event, organisationId) => {
        const {
            selectedOrganisation
        } = this.state

        const {
            params,
            location,
            router
        } = this.props

        // Check is zoom label
        if(location.query.zoom){
            router.push({
                pathname: `/${url.projects}/${params.id}/${url.groups}/${params.groupId}`,
                search: `?zoomOut=true&organisationId=${organisationId}`,
            })
            return
        }

        if (!_.isEmpty(selectedOrganisation)) {
            this.setState({selectedOrganisation: {}})
        } else {
            // Stop other event
            event.stopPropagation();

            // check organisation id is set in query params
            if(location.query.organisation){
                router.push({
                    pathname:`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`,
                    search: `?zoomOut=true`
                })
                return;
            }

            // Get the data from server
            let selectedOrganisation = await this.getOrganisation(organisationId);

            if (selectedOrganisation) {
                this.setState({
                    selectedOrganisation: {...selectedOrganisation}
                })
            }
        }
    }

    getOrganisation = async (organisationId) => {
        const {
            group
        } = this.props

        let selectedOrganisation = {};
        // Get organisation from group object
        _.map(group.organisations, (updatedCoordinate) => {
            if (updatedCoordinate.id === organisationId) {
                selectedOrganisation = {...updatedCoordinate}
            }
        });
        return selectedOrganisation
    }

    handleClick = (e) => {
        const {
            location,
            router,
            params
        } = this.props

        if (this.node) {
            if(this.node.isSameNode(e.target)){
                this.setState({
                    selectedDraggable: 0,
                    selectedOrganisation: {},
                    selectedCompetitor: 0,
                    selectedCluster: [],
                    showSelectedClusterItem: null
                })
            }
        }

        // if query params has organisationId, assume its a click to remove progress
        if(location.query.organisationId){
            router.push({
                pathname: `/${url.projects}/${params.id}/${url.groups}/${params.groupId}`,
                search: `?zoomOut=true`,
            })
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
                    organisation: {...response.data}
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
            location
        } = this.props

        const {
            selectedDraggable,
            selectedOrganisation,
            selectedCompetitor,
            actionPositionClass,
            showSelectedClusterItem,
            selectedCluster
        } = this.state

        // don't load unless we have the container's dimensions
        if (!container) {
            return null
        }

        let modifySelectedDraggable = selectedDraggable
        let modifySelectedOrganisation = selectedOrganisation

        const organisationId = location.query.organisationId && +location.query.organisationId
        if(organisationId){
            _.map(group.organisations, (organisation) => {
                if(organisation.id === organisationId){
                    modifySelectedOrganisation = {...organisation}
                    modifySelectedDraggable = organisation.id
                }
            })
        }

        const clusters = fn.getClusterDataSet(group.organisations)
        const organisationIndexes = groups.collection[params.groupId] && Object.keys(groups.collection[params.groupId].organisations)

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

                    {_.map(group.organisations, (item, i) => {
                        if (item.status < 1) {
                            return
                        }

                        // Check zoom view, does this item need to show
                        const isShow = fn.isItemShow(item, location);
                        if (!isShow) {
                            return;
                        }

                        // If it is on cluster, add 'cluster-item' class
                        let clusterItemClass = fn.getClusterItemClass(clusters, i)
                        let clusterItemShow = null

                        // If item selected from cluster then add this class
                        if (showSelectedClusterItem && showSelectedClusterItem === item.id) {
                            clusterItemShow = 'cluster-show'
                        }

                        // set fit text compress number
                        const fitTextCompress = item.icon_size === 's' ? .3 : .5;

                        const position = fn.getPosition(item, location);
                        const trajectoryClass = fn.getTrajectoryClass(item.trajectory);
                        const groupEditUrl = location.query.zoom ? `/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}?zoom=${location.query.zoom}` :
                            `/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}`

                        const peopleUrl = `/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${url.people}`
                        let assignCharacterLink = `/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}/${url.characters}`

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
                                             clusterItemClass,
                                             clusterItemShow,
                                             `size-${item.icon_size}`,
                                             `${trajectoryClass}`,
                                             (modifySelectedDraggable && modifySelectedDraggable !== item.id ? 'disabled' : ''),
                                             (modifySelectedDraggable === item.id ? 'is-selected' : '')
                                         ]
                                     }
                                >
                                    <div className="react-draggable-handle">
                                        <ReactFitText compressor={fitTextCompress}>
                                            <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                        </ReactFitText>

                                        <span className="user-colour-dot"
                                              style={{backgroundColor: item.profile_colour}}></span>
                                    </div>
                                    {modifySelectedDraggable === item.id &&
                                    <span className="react-draggable-title">{item.title}</span>
                                    }

                                    {modifySelectedDraggable === item.id &&
                                    <div className={`react-draggable-actions group-actions ${actionPositionClass}`}>
                                        <Link className="button-round five"
                                              to={assignCharacterLink}>
                                            <span className="button-round-inside icon-masks"/>
                                            Assign<br/>Character
                                        </Link>

                                        <Link className="button-round first"
                                              to={groupEditUrl}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        {item.coordinates && item.coordinates.length > 0 ? (
                                            <span className="clickable button-round second"
                                                  onClick={(event) => this.getCoordinate(event, item.id)}>
                                            <span
                                                className="button-round-inside icon-chain"/>{_.isEmpty(modifySelectedOrganisation) ? 'Progress' : 'Hide Progress'}
                                        </span>
                                        ) : (
                                            <span className="button-round second progress-hide">
                                            <span className="button-round-inside icon-chain"/>Progress
                                        </span>
                                        )}

                                        <Link className="button-round third"
                                              to={peopleUrl}>
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

                    {_.map(clusters, (cluster, i) => {
                            const clusterIds = _.map(cluster, (index) =>
                                (groups.collection[params.groupId].organisations[organisationIndexes[index]] || {}).id)

                            // get first group for cluster icon
                            let organisation = _.find(group.organisations, (organisation) => {
                                return organisation.id === clusterIds[0]
                            })

                            if (showSelectedClusterItem && clusterIds.includes(showSelectedClusterItem)) {
                                return;
                            }

                            const isShow = fn.isItemShow(organisation, location);
                            if (!isShow) {
                                return;
                            }
                            const position = fn.getPosition(organisation, location);

                            return (
                                <Draggable
                                    key={organisation.id}
                                    axis="none"
                                    handle=".react-draggable-handle"
                                    defaultPosition={{
                                        x: position.positionX,
                                        y: position.positionY
                                    }}
                                    grid={[10, 10]}
                                    scale={1}
                                    bounds=".gridwrapper-inner-section-wrapper"
                                    onStop={this.onHandleClusterEvent}
                                >

                                    <div handleid={clusterIds}
                                         className={
                                             [
                                                 `cluster`,
                                                 actionPositionClass,
                                                 (modifySelectedDraggable && modifySelectedDraggable !== organisation.id ? 'disabled' : ''),
                                                 (modifySelectedDraggable === organisation.id ? 'is-selected' : ''),
                                                 organisation
                                             ]
                                         }
                                    >
                                        <div className="react-draggable-handle cluster-handle">
                                            {organisation.icon_path ? (
                                                <img className="react-draggable-handle-icon"
                                                     src={`${organisation.icon_path}`}/>
                                            ) : (
                                                <div className="react-draggable-handle-title">{_.size(clusterIds)}</div>
                                            )}
                                            <span className="user-colour-dot"
                                                  style={{backgroundColor: organisation.profile_colour}}></span>
                                        </div>
                                        <span className="react-draggable-title"></span>

                                        {_.join(selectedCluster, ',') === _.join(clusterIds, ',') &&
                                        this.renderCurrentClusterItems(clusterIds)
                                        }
                                    </div>
                                </Draggable>
                            )
                        }
                    )}

                    {this.props.children}

                    {modifySelectedOrganisation.coordinates && !fn.isZoom(location) ?
                        <Coordinate {...this.props} group={modifySelectedOrganisation}/> : ''}

                    {groups.updatedOrganisations && groups.updatedOrganisations.length > 0 &&
                    <button className="button gridwrapper-save"
                            onClick={this.handleSaveChanges}>Save Changes
                    </button>
                    }
                </ContentLoader>
            </div>
        )
    }
}
