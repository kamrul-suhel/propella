import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {url} from 'app/constants';
import {api, fn} from 'app/utils';
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector';
import Coordinate from 'app/components/coordinate'
import {ContentLoader} from '@xanda/react-components';

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
        draggedGroups: state.draggedGroup
    };
})
export default class ProjectWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedDraggable: 0,
            selectedProgress: 0,
            selectedGroupCoordinates: {},
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
        this.fetchData();
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
        }));
    }

    onDraggableEventHandler = (event, data) => {
        const { location, project, draggedGroups, dispatch } = this.props

        // find the id we're moving
        const groupId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        // if we haven't moved assume its a click
        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            const actionPositionClass = fn.getDraggableActionClass({positionX: data.x, positionY: data.y})
            this.setState({'selectedDraggable': groupId, actionPositionClass: actionPositionClass})
        } else {
            const group = _.find(project.groups, (group)=>{
                return group.id === groupId
            })

            // get position
            const position = fn.getPositionForSave(data, location, group.icon_size)

            // put dragged item into store
            let selectedDraggedGroups =  [...draggedGroups.groups]
            let selectedGroup = {...group}

            _.remove(selectedDraggedGroups, (group)=> group.id === selectedGroup.id)
            selectedGroup.positionX = position.positionX
            selectedGroup.positionY = position.positionY
            selectedDraggedGroups.push(selectedGroup);
            dispatch({
                type:'DRAGGED_GROUP_UPDATE',
                payload:selectedDraggedGroups
            })
        }
    }

    handleSaveChanges = async () => {
        const {
            dispatch,
            draggedGroups
        } = this.props
        const saveGroups = [...draggedGroups.groups];
        const response = await api.put(`/groups`, {groups: saveGroups})

        if (!api.error(response)) {
            // Clear dragged group
            dispatch({
                type:'DRAGGED_GROUP_CLEAR'
            });

            this.fetchData()
        }
    }

    handleClick = (e) => {
        if (this.node) {
            if (!this.node.contains(e.target)) {
                this.setState({selectedDraggable: 0, selectedGroupCoordinates: {}})
            }
        }
    }

    getGroupCoordinate = (event, groupId) => {

        const { project, draggedGroups } = this.props;
        const { selectedGroupCoordinates } = this.state;

        if (!_.isEmpty(selectedGroupCoordinates)) {
            this.setState({selectedGroupCoordinates: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            let selectedGroup = _.find(project.groups, (group) => group.id === groupId)

            _.map(draggedGroups.groups, (updatedCoordinate) => {
                if (updatedCoordinate.id === selectedGroup.id) {
                    selectedGroup.positionX = updatedCoordinate.positionX;
                    selectedGroup.positionY = updatedCoordinate.positionY;
                }
            });

            if (selectedGroup) {
                this.setState({
                    selectedGroupCoordinates: selectedGroup
                })
            }
        }
    }

    handleResetChanges = () => {
        this.fetchData()
    }

    render() {
        const {
            projects,
            project,
            params,
            container,
            location,
            draggedGroups
        } = this.props

        const {
            selectedDraggable,
            selectedGroupCoordinates,
            progressLabel,
            actionPositionClass
        } = this.state

        const groups = fn.getAllSortedItem(project.groups, draggedGroups.groups)

        // dont load unless we have the container's dimensions
        if (!container) {
            return null
        }

        return (
            <div className="gridwrapper-inner-" ref={node => this.node = node}>
                <ContentLoader
                    data={projects.collection}
                    isLoading={projects.isLoading}
                >
                    {_.map(groups, (item) => {
                        if (item.status < 1) {
                            return
                        }

                        const isShow = fn.isItemShow(item, location);
                        if (!isShow) {
                            return;
                        }

                        const position = fn.getPosition(item, location);

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
                                disabled={selectedDraggable === item.id}>

                                <div handleid={item.id}
                                     className={
                                         [
                                             `size-${item.icon_size}`,
                                             (selectedDraggable && selectedDraggable !== item.id ? 'disabled' : ''),
                                             (selectedDraggable === item.id ? 'is-selected' : ''),
                                             item
                                         ]
                                     }
                                >

                                    {selectedDraggable === item.id &&
                                    <div className={`react-draggable-actions ${actionPositionClass}`}>
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${item.id}/edit`}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        {item.coordinates && item.coordinates.length > 0 ? (
                                            <span className="clickable button-round second"
                                                  onClick={(event) => fn.isZoom(location) ? null : this.getGroupCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>
                                                {_.isEmpty(selectedGroupCoordinates) ? 'Progress' : 'Hide Progress'}
                                            </span>
                                        ) : (
                                            <span className="button-round second progress-hide">
                                            <span className="button-round-inside icon-chain"/>Progress</span>
                                        )}

                                        <Link className="button-round third"
                                              to={`/${url.projects}/${params.id}/groups/${item.id}`}>
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
                                        {item.icon_path ? (
                                            <img className="react-draggable-handle-icon" src={`${item.icon_path}`}/>
                                        ) : (
                                            <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                        )}
                                        <span className="user-colour-dot"
                                              style={{backgroundColor: item.profile_colour}}></span>
                                    </div>
                                    {selectedDraggable === item.id &&
                                    <span className="react-draggable-title">{item.title}</span>
                                    }
                                </div>
                            </Draggable>
                        )
                    })
                    }
                    {this.props.children}

                    {selectedGroupCoordinates.coordinates && !fn.isZoom(location) ? <Coordinate group={selectedGroupCoordinates} {...this.props}/> : ''}

                    {draggedGroups.updatedGroup &&
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
