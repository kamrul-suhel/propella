import React from 'react';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {api} from 'app/utils';
import * as selector from './selector';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';

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
export default class Wrapper extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            updatedCoordinates: {}
        }
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
        const groupId = Number(_.find(data.node.attributes, {name: 'handleid'}).value)

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
        const {groups, group} = this.props
        const {updatedCoordinates} = this.state

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
                {_.map(group.organisations, (organisation) => {
                    if (organisation.status < 1) {
                        return
                    }
                    return (
                        <Draggable
                            key={organisation.id}
                            axis="both"
                            handle=".handle"
                            defaultPosition={{
                                x: containerWidth / 100 * organisation.positionX,
                                y: containerHeight / 100 * organisation.positionY
                            }}
                            grid={[10, 10]}
                            scale={1}
                            bounds=".gridwrapper-inner-section-wrapper"
                            onStop={this.onDraggableEventHandler}
                        >
                            <div handleid={organisation.id} className={`size-${organisation.icon_size}`}>
                                <div className="handle">{organisation.abbreviation}</div>
                            </div>
                        </Draggable>
                    )
                })
                }
                {childrenWithProps}
            </React.Fragment>
        )
    }
}
