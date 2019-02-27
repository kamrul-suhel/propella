import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import { api } from 'app/utils';
import * as selector from 'app/containers/group/selector';
import { Link } from "react-router";
import Coordinate from 'app/components/coordinate';
import { fn } from 'app/utils';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class PeopleWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            selectedPeople: {}
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

    handleClick = (e) => {
      if(!this.node.contains(e.target)){
        this.setState({selectedDraggable: 0, selectedPeople: {}})
      }
    }

    handleSaveChanges = async () => {
        const {updatedCoordinates} = this.state

        const response = await api.put(`/people`, {people: _.values(updatedCoordinates)})
        if (!api.error(response)) {
            // if successfull remove from pending updates
            this.setState({'updatedCoordinates': {}})
        }
    }

    handleHideOrganisation = async (id) => {
      const response = await api.put(`organisations/${id}`, {status: 0})
      if (!api.error(response)) {
        this.fetchData();
      }
    }

    getCoordinate = async (event, peopleId) => {
        const {selectedPeople} = this.state;

        if(!_.isEmpty(selectedPeople)){
            this.setState({selectedPeople: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            // Get the data from server
            const data = await api.get('people/'+peopleId);

            if (selectedPeople) {
                this.setState({
                    selectedPeople: {...data.data}
                })
            }
        }
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }

    handleSetTrajectory = async (peopleId, newTrajectory) => {
      const { params } = this.props
      const response = await api.put(`people/${peopleId}`, {trajectory: newTrajectory});
      this.props.dispatch(
  			{
  				type: 'GROUP_PEOPLE_UPDATED',
          payload: {
  					'groupId': params.groupId,
  					'personId': response.data.id,
            'person': response.data
  				}
  			}
  		)
    }

    render() {
        const {groups, group, params} = this.props
        const {updatedCoordinates, selectedDraggable, progressLabel, selectedPeople} = this.state

        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0

        // get the id's of the active organisations
        const activeOrganisationIds = _.map(group.organisations, (item) => {if(item.status === 1) return item.id})

        return (
            <div ref={node => this.node = node}>
                <ul className="gridwrapper-inner-categories filter">
                  {_.map(group.organisations, (item) => {
                    if (item.status < 1) {
                        return
                    }

                    return (
                      <li className="filter">
                        {item.title}
                        <span className="clickable icon-x-small" onClick={() => this.handleHideOrganisation(item.id)} />
                      </li>
                    )
                  })}
                </ul>
                {!_.isEmpty(updatedCoordinates) &&
                <React.Fragment>
                    <button className="button gridwrapper-save" onClick={this.handleSaveChanges}>Save Changes</button>
                </React.Fragment>
                }
                {_.map(group.people, (item) => {
                    // only display people belonging to an active organisation
                    if (item.status < 1 || !_.includes(activeOrganisationIds, item.organisation_id)) {
                        return
                    }

                    const trajectoryClass = (item.trajectory === 1) ? 'up': 'down'
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
                                 className={
                                     [
                                         `size-m`,
                                         `trajectory-${trajectoryClass}`,
                                         (selectedDraggable && selectedDraggable !== item.id ? 'disabled' : ''),
                                         (selectedDraggable === item.id ? 'is-selected' : '')
                                     ]
                                 }
                            >
                                <div className="react-draggable-handle">
                                    <span className={`person-icon avatar-${fn.getAvatarClass(item.size)}`}></span>
                                    <span className="person-abbr">{item.abbreviation}</span>
                                  {selectedDraggable === item.id &&
                                    <span className="react-draggable-title">{item.organisation_title}</span>
                                  }
                                </div>

                                {selectedDraggable === item.id &&
                                    <div className="react-draggable-actions">
                                        <Link className="button-round first"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.people}/${item.id}/${url.characters}`}>
                                            <span className="button-round-inside icon-masks"/>
                                            Assign<br/>Character
                                        </Link>

                                        <span className="clickable button-round second"
                                              onClick={(event) => this.getCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>Progess
                                        </span>

                                        <Link className="button-round third"
                                              to={`/${url.projects}/${params.id}/groups/${group.id}/${url.people}/${item.id}`}>
                                            <span className="button-round-inside icon-pencil"/>
                                            Edit
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

                {selectedPeople.coordinates ? <Coordinate group={selectedPeople}/> : ''}
            </div>
        )
    }
}
