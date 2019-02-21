import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {api} from 'app/utils';
import * as selector from './selector';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';
import {Link} from "react-router";
import Coordinate from 'app/components/coordinate'

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
    };
})
export default class GroupWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            selectedOrganisation: {}
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
        // find the id we're moving
        const organisationId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        if (data.deltaX === 0 || data.deltaY === 0) {
            this.setState({'selectedDraggable': organisationId})
        } else {
            // get the wrapper dimensions
            const container = document.getElementById('gridwrapper-inner')
            const maxWidth = container.clientWidth
            const maxHeight = container.clientHeight

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

    getCoordinate = async (event, organisationId) => {
        const {selectedOrganisation} = this.state;

        if(!_.isEmpty(selectedOrganisation)){
            this.setState({selectedOrganisation: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            // Get the data from server
            const data = await api.get('organisations/'+organisationId);

            if (selectedOrganisation) {
                this.setState({
                    selectedOrganisation: {...data.data}
                })
            }
        }
    }

    handleClick = (e) => {
      if(!this.node.contains(e.target)){
        this.setState({selectedDraggable: 0, selectedOrganisation: {}})
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

        const {updatedCoordinates, selectedDraggable, progressLabel, selectedOrganisation} = this.state

        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0

        return (
            <div ref={node => this.node = node}>
                {!_.isEmpty(updatedCoordinates) &&
                <React.Fragment>
                    <button className="button gridwrapper-save" onClick={this.handleSaveChanges}>Save Changes</button>
                </React.Fragment>
                }
                {_.map(group.organisations, (item) => {
                    console.log('Organisation: ', item);
                    if (item.status < 1) {
                        return
                    }
                    return (
                        <Draggable
                            key={item.id}
                            axis="both"
                            handle=".react-draggable-handle"
                            defaultPosition={{
                                x: containerWidth / 100 * item.positionX,
                                y: containerHeight / 100 * item.positionY
                            }}
                            grid={[10, 10]}
                            scale={1}
                            bounds=".gridwrapper-inner-section-wrapper"
                            onStop={this.onDraggableEventHandler}
                        >
                            <div handleid={item.id}
                                 className={`size-${item.icon_size}`}
                            >
                                <div className="react-draggable-handle">
                                  <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                </div>
                                {selectedDraggable === item.id &&
                                  <span className="react-draggable-title">{item.title}</span>
                                }

                                {selectedDraggable === item.id &&
                                    <div className="react-draggable-actions">
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}`}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        <span className="clickable button-round second"
                                              onClick={(event) => this.getCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>Progess
                                        </span>

                                        <Link className="button-round third"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${url.people}`}>
                                            <span className="button-round-inside icon-add-organisation"/>
                                            People
                                        </Link>

                                        <Link className="button-round fourth"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.people}/add?organisation_id=${item.id}`}>
                                            <span className="button-round-inside icon-character-pirate"/>
                                            Add Person
                                        </Link>
                                    </div>
                                }

                            </div>
                        </Draggable>
                    )
                })
                }
                {this.props.children}

                {selectedOrganisation.coordinates ? <Coordinate group={selectedOrganisation}/> : ''}
            </div>
        )
    }
}
