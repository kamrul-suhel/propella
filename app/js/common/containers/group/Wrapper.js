import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {api} from 'app/utils';
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
    };
})
export default class GroupWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            selectedCompetitor: 0,
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
        const { container } = this.props

        // find the id we're moving
        const organisationId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            this.setState({'selectedDraggable': organisationId})
        } else {
            const newY = 100 - _.round((data.y / container.height) * 100, 4)
            const newX = _.round((data.x / container.width) * 100, 4)

            this.setState({
                updatedCoordinates: {
                    ...this.state.updatedCoordinates,
                    [organisationId]: {id: organisationId, positionX: newX, positionY: newY}
                }
            })
        }
    }

    getCoordinate = async (event, organisationId) => {
        const {selectedOrganisation, updatedCoordinates} = this.state;

        if (!_.isEmpty(selectedOrganisation)) {
            this.setState({selectedOrganisation: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            // Get the data from server
            const data = await api.get('organisations/' + organisationId);
            let selectedOrganisation = {...data.data};
            _.map(updatedCoordinates, (updatedCoordinate) => {
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
      if(this.node){
        if (!this.node.contains(e.target)) {
            this.setState({selectedDraggable: 0, selectedOrganisation: {}, selectedCompetitor: 0})
        }
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

    handleSetTrajectory = async (organisationId, newTrajectory) => {
        const {params} = this.props
        const response = await api.put(`organisations/${organisationId}`, {trajectory: newTrajectory});
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
        const {groups, group, params, container} = this.props
        const {updatedCoordinates, selectedDraggable, progressLabel, selectedOrganisation, selectedCompetitor} = this.state

        // dont load unless we have the container's dimensions
        if(!container){
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
                                 onClick={() => this.handleSelectCompetitor(item.id)}>
                                {selectedCompetitor === item.id &&
                                <div className="competitor-tooltip">
                                    <div className="competitor-tooltip-header">{item.title}</div>
                                    <div className="competitor-tooltip-inner">
                                        <Link
                                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.competitors}`}>Edit</Link>
                                    </div>
                                </div>
                                }
                            </div>
                        )
                    })}

                    {_.map(group.organisations, (item) => {
                        if (item.status < 1) {
                            return
                        }
                        const trajectoryClass = (item.trajectory === 1) ? 'up' : 'down'

                        return (
                            <Draggable
                                key={item.id}
                                axis="both"
                                handle=".react-draggable-handle"
                                defaultPosition={{
                                    x: container.width / 100 * item.positionX,
                                    y: container.height - (container.height / 100 * item.positionY)
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
                                    <div className="react-draggable-actions">
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.organisations}/${item.id}`}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
                                        </Link>

                                        {item.coordinates && item.coordinates.length > 0 ? (
                                        <span className="clickable button-round second"
                                              onClick={(event) => this.getGroupCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>{_.isEmpty(selectedGroupCoordinates) ? 'Progress' : 'Hide Progress'}
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
                                                  const newTrajectory = (item.trajectory == 0) ? 1 : 0
                                                  this.handleSetTrajectory(item.id, newTrajectory)
                                              }}
                                        >
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

                    {selectedOrganisation.coordinates ? <Coordinate group={selectedOrganisation}/> : ''}

                    {!_.isEmpty(updatedCoordinates) &&
                    <React.Fragment>
                        <button className="button gridwrapper-save" onClick={this.handleSaveChanges}>Save Changes
                        </button>
                    </React.Fragment>
                    }

                </ContentLoader>
            </div>
        )
    }
}
