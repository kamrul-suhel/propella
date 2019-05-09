import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {fn, api} from 'app/utils';
import * as selector from 'app/containers/group/selector';
import {makeGetPeople} from './selector';
import {Link} from "react-router";
import Coordinate from 'app/components/coordinate';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetGroups();
    const getGroup = selector.makeGetGroup();
    const getPeople = makeGetPeople();

    return {
        people: getPeople(state),
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        draggedPeople: state.draggedPeople
    };
})
export default class PeopleWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedDraggable: 0,
            selectedPeople: {},
            actionPositionClass: ''
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
        }));
    }

    onDraggableEventHandler = (event, data) => {
        const {
            dispatch,
            location,
            group,
            draggedPeople,
            params
        } = this.props

        // find the id we're moving
        const peopleId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        if (Math.abs(data.deltaX) === 0 && Math.abs(data.deltaY) === 0) {
            const actionPositionClass = fn.getDraggableActionClass({positionX: data.x, positionY: data.y})
            this.setState({'selectedDraggable': peopleId, actionPositionClass: actionPositionClass})
        } else {
            let people = _.find(group.people, (people) => {
                return people.id === peopleId
            })
            // get the wrapper dimensions
            const position = fn.getPositionForSave(data, location, people.icon_size)

            // put dragged item into store
            let selectedPeople =  [...draggedPeople.people]

            _.remove(selectedPeople, (currPeople)=> currPeople.id === people.id)
            people.positionX = position.positionX
            people.positionY = position.positionY

            dispatch({
                type:'UPDATE_DRAGGED_PEOPLE',
                payload:{
                    groupId: params.groupId,
                    people
                }
            })
        }
    }

    handleSaveChanges = async () => {
        const {
            groups,
            group,
            dispatch,
        } = this.props

        const draggedPeopleIds = [...groups.updatedPeople];
        let draggedPeople  = [];
        _.map(draggedPeopleIds, (id) => {
            const people = _.find(group.people, (p) => {
                if(p.id === id){
                    return p;
                }
            })

            let updatedPeople = {
                id: people.id,
                positionX: people.positionX,
                positionY: people.positionY
            }

            draggedPeople.push(updatedPeople)
        })

        const response = await api.put(`/people`, {people: draggedPeople})
        if (!api.error(response)) {
            dispatch({
                type:'CLEAR_DRAGGED_PEOPLE'
            });

            this.fetchData()
        }
    }

    handleClick = (e) => {
        if (this.node) {
            if (!this.node.contains(e.target)) {
                this.setState({selectedDraggable: 0, selectedPeople: {}})
            }
        }
    }

    handleHideOrganisation = async (id) => {
        const response = await api.put(`organisations/${id}`, {status: 0})
        if (!api.error(response)) {
            this.fetchData();
        }
    }

    getCoordinate = async (event, peopleId) => {
        const {selectedPeople, updatedCoordinates} = this.state;

        if (!_.isEmpty(selectedPeople)) {
            this.setState({selectedPeople: {}})
        } else {
            // Stop other event
            event.stopPropagation();
            // Get the data from server
            const data = await api.get('people/' + peopleId);

            let selectedPeople = {...data.data};

            _.map(updatedCoordinates, (updatedCoordinate) => {
                if (updatedCoordinate.id === selectedPeople.id) {
                    selectedPeople.positionX = updatedCoordinate.positionX;
                    selectedPeople.positionY = updatedCoordinate.positionY;
                }
            });

            if (selectedPeople) {
                this.setState({
                    selectedPeople: {...selectedPeople}
                })
            }
        }
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }

    handleSetTrajectory = async (people) => {
        const {params, draggedPeople} = this.props
        const newTrajectory = fn.getTrajectory(people.trajectory)
        _.map(draggedPeople.people, (draggedPeople) => {
            if(draggedPeople.id === people.id){
                people = {...draggedPeople}
            }
        })
        const response = await api.put(`people/${people.id}`, {trajectory: newTrajectory})

        this.props.dispatch({
            type: 'DRAGGED_PEOPLE_CLEAR'
        })

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
        const {
            group,
            params,
            container,
            people,
            location,
            draggedPeople,
            groups
        } = this.props

        const {
            selectedDraggable,
            selectedPeople,
            actionPositionClass
        } = this.state

        const sortedPeople = fn.getAllSortedItem(group.people, draggedPeople.people)

        if (!container) {
            return null
        }

        // get the id's of the active organisations
        const activeOrganisationIds = _.map(group.organisations, (item) => {
            if (item.status === 1) return item.id
        })

        return (
            <div ref={node => this.node = node}>
                <ul className="gridwrapper-inner-categories filter">
                    {_.map(group.organisations, (item) => {
                        if (item.status < 1) {
                            return
                        }

                        return (
                            <li className="filter"
                                key={item.id}>
                                {item.title}
                                <span className="clickable icon-x-small"
                                      onClick={() => this.handleHideOrganisation(item.id)}/>
                            </li>
                        )
                    })}
                </ul>

                { groups.updatedPeople && groups.updatedPeople.length > 0 &&
                    <button className="button gridwrapper-save"
                            onClick={this.handleSaveChanges}>Save Changes
                    </button>
                }

                {_.map(sortedPeople, (item) => {
                    // only display people belonging to an active organisation
                    if (item.status < 1 || !_.includes(activeOrganisationIds, item.organisation_id)) {
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
                                         `size-m`,
                                         `trajectory-${trajectoryClass}`,
                                         (selectedDraggable && selectedDraggable !== item.id ? 'disabled' : ''),
                                         (selectedDraggable === item.id ? 'is-selected' : '')
                                     ]
                                 }
                            >
                                <div className="react-draggable-handle">
                                    {people.showCharacters && item.character_id !== 0 ? (
                                        <span className={`person-icon avatar-${fn.getAvatarClass(item.size)}`}></span>
                                    ) : (
                                        <span
                                            className={`person-icon ${fn.getPeopleCharacter(item.character_id)['iconImage']}`}></span>
                                    )}
                                    <span className="person-abbr">{item.abbreviation}</span>
                                    {selectedDraggable === item.id &&
                                    <span className="react-draggable-title">{item.organisation_title}</span>
                                    }
                                </div>

                                {selectedDraggable === item.id &&
                                <div className={`react-draggable-actions ${actionPositionClass}`}>
                                    <Link className="button-round first"
                                          to={`/${url.projects}/${params.id}/groups/${group.id}/${url.people}/${item.id}/${url.characters}`}>
                                        <span className="button-round-inside icon-masks"/>
                                        Assign<br/>Character
                                    </Link>

                                    {item.coordinates && item.coordinates.length > 0 ? (
                                        <span className="clickable button-round second"
                                              onClick={(event) => fn.isZoom(location) ? null : this.getCoordinate(event, item.id)}>
                                            <span className="button-round-inside icon-chain"/>
                                            {_.isEmpty(selectedPeople) ? 'Progress' : 'Hide Progress'}
                                            </span>
                                    ) : (
                                        <span className="button-round second progress-hide">
                                            <span className="button-round-inside icon-chain"/>Progress</span>
                                    )}

                                    <Link className="button-round third"
                                          to={`/${url.projects}/${params.id}/groups/${group.id}/${url.people}/${item.id}`}>
                                        <span className="button-round-inside icon-pencil"/>
                                        Edit
                                    </Link>

                                    <span className="button-round fourth clickable"
                                          onClick={() => {
                                              this.handleSetTrajectory(item)
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

                {selectedPeople.coordinates && !fn.isZoom(location) ? <Coordinate {...this.props} group={selectedPeople}/> : ''}
            </div>
        )
    }
}
