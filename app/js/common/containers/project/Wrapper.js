import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {url} from 'app/constants';
import {api} from 'app/utils';
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector';
import Coordinate from 'app/components/coordinate'

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
    };
})
export default class Wrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            clickOutSide: false,
            selectedGroupCoordinates: {},
            progressLabel: 'Progress'
        }
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
        // find the id we're moving
        const groupId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        // if we haven't moved assume its a click
        if (data.deltaX === 0 || data.deltaY === 0) {
            this.setState({'selectedDraggable': groupId, clickOutSide: false})
        } else {
            // get the wrapper dimensions
            const maxWidth = data.node.parentNode.clientWidth
            const maxHeight = data.node.parentNode.clientHeight

            const newY = _.round((data.y / maxHeight) * 100, 4)
            const newX = _.round((data.x / maxWidth) * 100, 4)

            this.setState({
                updatedCoordinates: {
                    ...this.state.updatedCoordinates,
                    [groupId]: {id: groupId, positionX: newX, positionY: newY}
                }
            })
        }
    }

    handleSaveChanges = async () => {
        const {updatedCoordinates} = this.state

        const response = await api.put(`/groups`, {groups: _.values(updatedCoordinates)})
        if (!api.error(response)) {
            // if successfull remove from pending updates
            this.setState({'updatedCoordinates': {}})
        }
    }

    handleClickInside = (e, groupId) => {
        const click = !this.state.clickOutSide;
        this.setState({
            selectedGroupCoordinates: {}
        });

        if (groupId === this.state.selectedDraggable) {
            this.setState({
                clickOutSide: click,
                progressLabel: 'Progress'
            })
        }
    }

    getGroupCoordinate = (event, groupId) => {
        const {project} = this.props;

        // Stop other event
        event.stopPropagation();
        const selectedGroup = _.find(project.groups, (group) => group.id === groupId)

        if (selectedGroup) {
            this.setState({
                selectedGroupCoordinates: selectedGroup,
                progressLabel:'Hi progress'
            })
        }
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }

    render() {
        const {project, params} = this.props
        const {updatedCoordinates, selectedDraggable, selectedGroupCoordinates, progressLabel, clickOutSide} = this.state
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
                {_.map(project.groups, (group) => {
                    if (group.status < 1) {
                        return
                    }

                    return (
                        <Draggable
                            key={group.id}
                            axis="both"
                            handle=".handle"
                            defaultPosition={{
                                x: containerWidth / 100 * group.positionX,
                                y: containerHeight / 100 * group.positionY
                            }}
                            grid={[10, 10]}
                            scale={1}
                            bounds=".gridwrapper-inner-section-wrapper"
                            onStop={this.onDraggableEventHandler}
                            disabled={selectedDraggable === group.id}
                        >
                            <div handleid={group.id}
                                 className={`size-${group.icon_size}`}
                                 onClick={(e) => this.handleClickInside(e, group.id)}>

                                {group.icon_path ? <div className="icon-path"
                                                        style={{backgroundImage: `url(${group.icon_path})`}}></div> : ''}

                                {selectedDraggable === group.id && clickOutSide &&
                                <div className="react-draggable-actions">
                                    <Link className="button-round first"
                                          to={`/${url.projects}/${params.id}/groups/${group.id}/edit`}>
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
                                        Organisations
                                    </Link>

                                    <Link className="button-round fourth"
                                          to={`/${url.projects}/${params.id}/groups/${group.id}/competitors`}>
                                        <span className="button-round-inside"/>
                                        Add Competitor
                                    </Link>
                                </div>
                                }
                                <div className="handle">
                                    {group.abbreviation}
                                </div>
                            </div>
                        </Draggable>
                    )
                })
                }
                {childrenWithProps}

                {selectedGroupCoordinates.coordinates ? <Coordinate group={selectedGroupCoordinates}/> : ''}
            </React.Fragment>
        )
    }
}
