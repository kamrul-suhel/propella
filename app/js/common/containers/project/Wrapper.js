import React from 'react'
import {Link} from 'react-router'
import {fetchData} from 'app/actions'
import {connect} from 'react-redux'
import Draggable from 'react-draggable'
import {url} from 'app/constants'
import {api, fn} from 'app/utils'
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector'
import Coordinate from 'app/components/coordinate'
import { Cluster } from "app/components"
import ReactFitText from 'react-fittext'

import {ContentLoader} from '@xanda/react-components'

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id)
    };
})
export default class ProjectWrapper extends React.PureComponent {
    constructor(props) {
        super(props)
        const { location } = props

        this.state = {
            selectedDraggable: 0,
            selectedProgress: 0,
            selectedGroupCoordinates: {},
            actionPositionClass: '',
            selectedCluster: [],
            showSelectedClusterItem: null
        }
    }

    componentWillMount() {
        const {location} = this.props
        document.addEventListener('mousedown', this.handleClick, false)
        document.addEventListener('touchstart', this.handleClick, false)

        // If progress query params is set then do progress
        if(location.query.progress){
            this.getGroupCoordinate(null, location.query.progress)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false)
        document.removeEventListener('touchstart', this.handleClick, false)
    }

    componentDidMount() {
        const {location} = this.props
        !location.query.zoom && !location.query.zoomOut ? this.fetchData() : null;
    }

    getGroupCoordinate = (event = null, groupId) => {
        const {location, router, params} = this.props
        const {project} = this.props;
        const {selectedGroupCoordinates} = this.state

        // Check if it is zoom or not
        if(location.query.zoom){
            router.push({
                pathname: `/${url.projects}/${params.id}`,
                search: `?zoomOut=true&groupId=${groupId}`,
            })
            return
        }

        if (!_.isEmpty(selectedGroupCoordinates)) {
            this.setState({selectedGroupCoordinates: {}})
        } else {
            // Stop other event
            if(event !== null){
                event.stopPropagation()
            }

            // check groupId is set in query params
            if(location.query.groupId){
                router.push({
                    pathname:`/${url.projects}/${params.id}`,
                    search: `?zoomOut=true`
                })
                return;
            }

            let selectedGroup = _.find(project.groups, (group) => group.id === groupId)

            if (selectedGroup) {
                this.setState({
                    selectedGroupCoordinates: selectedGroup
                })
            }
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
            projectId: this.props.params.id
        }));
    }

    onDraggableEventHandler = (event, data) => {
        const {
            location,
            params,
            project,
            dispatch
        } = this.props

        const projectId = params.id
        // find the id we're moving
        const groupId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)
        // if we haven't moved assume its a click
        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            const actionPositionClass = fn.getDraggableActionClass({positionX: data.x, positionY: data.y})
            this.setState({
                selectedDraggable: groupId,
                actionPositionClass: actionPositionClass
            })
        } else {
            const group = _.find(project.groups, (group) => {
                return group.id === groupId
            })

            // get position
            const position = fn.getPositionForSave(data, location, group.icon_size)
            // Update position
            group.positionX = position.positionX
            group.positionY = position.positionY

            dispatch({
                type: 'GROUP_UPDATE',
                payload: {
                    project_id: projectId,
                    group
                }
            })
        }
    }

    onClusterEventHandler = (event, data) => {
        // find the id we're moving
        const clusterIds = _.split(_.find(data.node.attributes, {name: 'handleid'}).value, ',')
        const actionPositionClass = fn.getClusterItemsPositionClass({positionX: data.x, positionY: data.y})

        this.setState({
            selectedCluster: clusterIds,
            showSelectedClusterItem: null,
            actionPositionClass: actionPositionClass
        })
    }

    handleClusterItem = (group) => {
        const { location } = this.props
        const selectedGroup = fn.getPosition(group, location)
        const actionPositionClass = fn.getDraggableActionClass({positionX: selectedGroup.positionX, positionY: selectedGroup.positionY})
        this.setState({
            selectedCluster: [],
            showSelectedClusterItem: group.id,
            selectedDraggable: group.id,
            actionPositionClass: actionPositionClass
        })
    }

    renderCurrentClusterItems = (ids) => {
        const {project} = this.props

        //get all groups
        let currentGroups = [];
        _.map(ids, (id) => {
            _.map(project.groups, (group) => {
                if (parseInt(id) === group.id) {
                    currentGroups.push(group)
                }
            })
        })

        return (
            <div className={`cluster-items`}>
                <div className={'cluster-body'}>
                    <div className={'cluster-body-inner'}>
                        {
                            _.map(currentGroups, (group) => {
                                return (
                                    <div
                                        key={group.id}
                                        className="size-m icon_size"
                                        onClick={() => this.handleClusterItem(group)}
                                    >
                                        <div className="react-draggable-handle">
                                            {group.icon_path ? (
                                                <img className="react-draggable-handle-icon"
                                                     src={`${group.icon_path}`}/>
                                            ) : (
                                                <ReactFitText compressor={.6}>
                                                    <div className="react-draggable-handle-title">{group.abbreviation}</div>
                                                </ReactFitText>
                                            )}
                                            <span className="user-colour-dot"
                                                  style={{backgroundColor: group.profile_colour}}></span>
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

    handleSaveChanges = async () => {
        const {projects, project, dispatch} = this.props
        const updatedGroupIds = [...projects.updatedGroups];

        // Find the group
        let selectedGroups = [];
        _.map(updatedGroupIds, (id) => {
            const group = _.find(project.groups, (g) => {
                if (g.id === id) {
                    return g;
                }
            })

            let newGroup = {
                id: group.id,
                positionX: group.positionX,
                positionY: group.positionY
            }

            selectedGroups.push(newGroup)
        })

        const response = await api.put(`/groups`, {groups: selectedGroups})

        if (!api.error(response)) {
            // Clear dragged group
            dispatch({
                type: 'CLEAR_UPDATED_GROUP'
            })
            this.fetchData()
        }
    }

    handleClick = (e) => {
        const {
            location,
            router,
            params
        } = this.props

        if (this.node) {
            if (!this.node.contains(e.target)) {
                this.setState({
                    selectedDraggable: 0,
                    selectedGroupCoordinates: {},
                    selectedCluster: [],
                    showSelectedClusterItem: null
                })
            }
        }

        // if query params has groupId assume its a click to remove progress
        if(location.query.groupId){
            router.push({
                pathname: `/${url.projects}/${params.id}`,
                search: `?zoomOut=true`,
            })
        }
    }



    handleResetChanges = () => {
        this.fetchData()
    }

    handleGroupChange = (event, id) => {

    }

    renderCoordinate(selectedCoordinate){
        let coordinate = {}

        if(selectedCoordinate !== null){
            coordinate = selectedCoordinate
        }else{
            coordinate = selectedCoordinate
        }
        return(<Coordinate group={coordinate} {...this.props}/>)
    }

    render() {
        const {
            projects,
            project,
            params,
            container,
            location
        } = this.props

        const {
            selectedDraggable,
            selectedGroupCoordinates,
            actionPositionClass,
            selectedCluster,
            showSelectedClusterItem
        } = this.state

        // dont load unless we have the container's dimensions
        if (!container) {
            return null
        }

        let modifySelectedDraggable = selectedDraggable

        // Get coordinate for selected group
        // Come from state or query
        let groupCoordinates = {}
        const groupId = location.query.groupId && +location.query.groupId
        if(groupId){
            let selectedGroup = {}
            _.map(project.groups, (group) => {
                if(group.id === groupId){
                    selectedGroup = {...group}
                    modifySelectedDraggable = group.id
                }
            })

            groupCoordinates = selectedGroup
        }else{
            groupCoordinates = {...selectedGroupCoordinates}
        }

        const projectGroupIndexes = project.groups && Object.keys(projects.collection[this.props.params.id].groups)
        const clusters = fn.getClusterDataSet(project.groups, location)

        return (
            <div ref={node => this.node = node}>
                <ContentLoader
                    data={projects.collection}
                    isLoading={projects.isLoading}
                >
                    {_.map(project.groups, (item, i) => {
                        if (item.status < 1) {
                            return
                        }

                        // If it is on cluster, add 'cluster-item' class
                        let clusterItemClass = fn.getClusterItemClass(clusters, i)
                        let clusterItemShow = null

                        // If item selected from cluster then add this class
                        if (showSelectedClusterItem && showSelectedClusterItem === item.id) {
                            clusterItemShow = 'cluster-show'
                        }

                        // does this item show in zoom view
                        const isShow = fn.isItemShow(item, location);
                        if (!isShow) {
                            return;
                        }

                        // set fit text compress number
                        const fitTextCompress = item.icon_size === 's' ? .3 : .5;
                        const position = fn.getPosition(item, location);

                        // to edit project in zoom and normal mode
                        const projectEditUrl = location.query.zoom ? `/${url.projects}/${params.id}/${url.groups}/${item.id}/edit?zoom=${location.query.zoom}&fetch=true`
                            :
                            `/${url.projects}/${params.id}/${url.groups}/${item.id}/edit?fetch=true`


                        const hasOrganisations = _.isEmpty(item.organisations) ? 'organisations' : ''
                        const organisationUrl = `/${url.projects}/${params.id}/${url.groups}/${item.id}/${hasOrganisations}`

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
                                disabled={modifySelectedDraggable === item.id && clusterItemShow === null}>

                                <div handleid={item.id}
                                     className={
                                         [
                                             clusterItemClass,
                                             clusterItemShow,
                                             `size-${item.icon_size}`,
                                             (modifySelectedDraggable && modifySelectedDraggable !== item.id ? 'disabled' : ''),
                                             (modifySelectedDraggable === item.id ? 'is-selected' : ''),
                                             item
                                         ]
                                     }
                                >

                                    {modifySelectedDraggable === item.id &&
                                    <div className={`react-draggable-actions ${actionPositionClass}`}>
                                        <Link className="button-round first"
                                              to={projectEditUrl}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        {item.coordinates && item.coordinates.length > 0 ? (
                                            <span className="clickable button-round second"
                                                  onClick={(event) => this.getGroupCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>
                                                {_.isEmpty(groupCoordinates) ? 'Progress' : 'Hide Progress'}
                                            </span>
                                        ) : (
                                            <span className="button-round second progress-hide">
                                            <span className="button-round-inside icon-chain"/>Progress</span>
                                        )}

                                        <Link className="button-round third"
                                              to={organisationUrl}>
                                            <span className="button-round-inside icon-add-organisation"/>
                                            Organisations
                                        </Link>

                                        <Link className="button-round fourth"
                                              to={`/${url.projects}/${params.id}/groups/${item.id}/competitors`}>
                                            <span className="button-round-inside icon-character-pirate"></span>
                                            Competitors
                                        </Link>
                                    </div>
                                    }
                                    <div className="react-draggable-handle">
                                        <ReactFitText compressor={fitTextCompress}>
                                            <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                        </ReactFitText>
                                        <span className="user-colour-dot"
                                              style={{backgroundColor: item.profile_colour}}>
                                        </span>
                                    </div>
                                    {modifySelectedDraggable === item.id &&
                                        <span className="react-draggable-title">{item.title}</span>
                                    }
                                </div>
                            </Draggable>
                        )
                    })
                    }

                    {_.map(clusters, (cluster, i) => {
                            const clusterIds = _.map(cluster, (index) =>
                                (projects.collection[this.props.params.id].groups[projectGroupIndexes[index]] || {}).id)

                            // get first group for cluster icon
                            let group = _.find(project.groups, (group) => {
                                return group.id === clusterIds[0]
                            })

                            if (showSelectedClusterItem && clusterIds.includes(showSelectedClusterItem)) {
                                return;
                            }

                            // Check is item need to show in zoom view.
                            const isShow = fn.isItemShow(group, location);
                            if (!isShow) {
                                return;
                            }

                            return (
                                <Cluster
                                    key={group.id}
                                    item={group}
                                    classes={
                                        [
                                            `cluster`,
                                            actionPositionClass,
                                            (modifySelectedDraggable && modifySelectedDraggable !== group.id ? 'disabled' : ''),
                                            (modifySelectedDraggable === group.id ? 'is-selected' : ''),
                                            group
                                        ]
                                    }
                                    clusterIds={clusterIds}
                                    selectedCluster={selectedCluster}
                                    onClusterEventHandler={(event, item) => this.onClusterEventHandler(event, item)}
                                    handleClusterItem={(item) => this.handleClusterItem(item)}
                                    {...this.props}
                                    type="project"
                                />
                            )
                        }
                    )}

                    {this.props.children}

                    {
                        groupCoordinates.coordinates && !fn.isZoom(location) ?
                        this.renderCoordinate(groupCoordinates)
                        : ''
                    }

                    {projects.updatedGroups.length > 0 &&
                    <React.Fragment>
                        <button className="button gridwrapper-save"
                                onClick={this.handleSaveChanges}>Save Changes
                        </button>
                    </React.Fragment>
                    }
                </ContentLoader>
            </div>
        )
    }
}
