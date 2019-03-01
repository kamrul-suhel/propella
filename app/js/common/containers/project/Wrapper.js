import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {url} from 'app/constants';
import {api} from 'app/utils';
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector';
import Coordinate from 'app/components/coordinate'
import {ContentLoader} from '@xanda/react-components';

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
    };
})
export default class ProjectWrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {},
            selectedDraggable: 0,
            selectedProgress: 0,
            selectedGroupCoordinates: {}
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
        // find the id we're moving
        const groupId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

        // if we haven't moved assume its a click
        if (data.deltaX === 0 && data.deltaY === 0) {
            this.setState({'selectedDraggable': groupId})
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
            this.fetchData()
        }
    }

    handleClick = (e) => {
      if(!this.node.contains(e.target)){
        this.setState({selectedDraggable: 0, selectedGroupCoordinates: {}})
      }
    }

    getGroupCoordinate = (event, groupId) => {
        const {project} = this.props;
        const {selectedGroupCoordinates} = this.state;

        if(!_.isEmpty(selectedGroupCoordinates)){
          this.setState({selectedGroupCoordinates: {}})
        } else {
          // Stop other event
          event.stopPropagation();
          const selectedGroup = _.find(project.groups, (group) => group.id === groupId)

          if (selectedGroup) {
              this.setState({
                  selectedGroupCoordinates: selectedGroup
              })
          }
        }
    }

    handleDraggableClick = (e) => {
      const { selectedDraggable } = this.state
      const groupId = Number(_.find(e.node.attributes, {name: 'handleid'}).value)
      if(selectedDraggable === groupId){
        this.setState({'selectedDraggable': 0})
      }
    }

    handleResetChanges = () => {
        this.setState({updatedCoordinates: []}, this.fetchData())
    }


    render() {
        const {projects, project, params} = this.props
        const {updatedCoordinates, selectedDraggable, selectedGroupCoordinates, progressLabel} = this.state

        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0

        return (
            <div className="gridwrapper-inner-" ref={node => this.node = node}>
              <ContentLoader
                data={projects.collection}
                isLoading={projects.isLoading}
                >
                {_.map(project.groups, (item) => {
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
                            disabled={selectedDraggable === item.id}
                        >
                            <div handleid={item.id}
                                 className={
                                     [
                                         `size-${item.icon_size}`,
                                         (selectedDraggable && selectedDraggable !== item.id ? 'disabled' : ''),
                                         (selectedDraggable === item.id ? 'is-selected' : ''),
                                         item
                                     ]
                                 }
                                 onClick={this.handleDraggableClick}
                                 >

                                {selectedDraggable === item.id &&
                                <div className="react-draggable-actions">
                                    <Link className="button-round first"
                                          to={`/${url.projects}/${params.id}/groups/${item.id}/edit`}>
                                        <span className="button-round-inside icon-pencil"/>
                                        Edit
                                    </Link>

                                    <span className="clickable button-round second"
                                          onClick={(event) => this.getGroupCoordinate(event, item.id)}>
                                        <span className="button-round-inside icon-chain"/>{_.isEmpty(selectedGroupCoordinates) ? 'Progress' : 'Hide Progress'}
                                    </span>

                                    <Link className="button-round third"
                                          to={`/${url.projects}/${params.id}/groups/${item.id}/`}>
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
                                      <img className="react-draggable-handle-icon" src={`${item.icon_path}`} />
                                    ) : (
                                      <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                    )}
                                <span className="user-colour-dot" style={{backgroundColor: item.profile_colour}}></span>
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

                {selectedGroupCoordinates.coordinates ? <Coordinate group={selectedGroupCoordinates}/> : ''}
                 {!_.isEmpty(updatedCoordinates) &&
                <React.Fragment>
                    <button className="button gridwrapper-save" onClick={this.handleSaveChanges}>Save Changes</button>
                </React.Fragment>
                }
                </ContentLoader>
            </div>
        )
    }
}
