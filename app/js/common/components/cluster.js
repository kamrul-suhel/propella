import React, {Component} from 'react'
import Draggable from "react-draggable";
import {connect} from 'react-redux'
import {fn} from 'app/utils'
import {makeGetProject, makeGetProjects} from 'app/containers/project/selector'
import ReactFitText from 'react-fittext'

@connect((state, ownProps) => {
    const getProject = makeGetProject();
    return {
        project: getProject(state, ownProps.params.id)
    }
})

export default class Cluster extends React.PureComponent {

    constructor(props) {
        super(props)
    }

    renderCurrentClusterItems = (ids) => {
        const {project} = this.props

        //get all groups
        let currentItems = [];
        _.map(ids, (id) => {
            _.map(project.groups, (item) => {
                if (parseInt(id) === item.id) {
                    currentItems.push(item)
                }
            })
        })

        return (
            <div className={`cluster-items`}>
                <div className={'cluster-body'}>
                    <div className={'cluster-body-inner'}>
                        {
                            _.map(currentItems, (item) => {
                                return (
                                    <div
                                        key={item.id}
                                        className="size-m icon_size"
                                        onClick={() => this.props.handleClusterItem(item)}
                                    >
                                        <div className="react-draggable-handle">
                                            <ReactFitText compressor={.4}>
                                                <div className="react-draggable-handle-title">{item.abbreviation}</div>
                                            </ReactFitText>

                                            <span className="user-colour-dot"
                                                  style={{backgroundColor: item.profile_colour}}></span>
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

    render() {
        const {
            item,
            classes,
            clusterIds,
            selectedCluster,
            location
        } = this.props

        const position = fn.getPosition(item, location);

        return (
            <Draggable
                axis="none"
                handle=".react-draggable-handle"
                defaultPosition={{
                    x: position.positionX,
                    y: position.positionY
                }}
                grid={[10, 10]}
                scale={1}
                bounds=".gridwrapper-inner-section-wrapper"
                onStop={this.props.onClusterEventHandler}>
                <div handleid={clusterIds}
                     className={classes}>
                    <div className="react-draggable-handle cluster-handle">

                        <div className="react-draggable-handle-title">{_.size(clusterIds)}</div>
                        <span className="user-colour-dot"
                              style={{backgroundColor: item.profile_colour}}></span>
                    </div>
                    <span className="react-draggable-title"></span>

                    {_.join(selectedCluster, ',') === _.join(clusterIds, ',') &&
                        this.renderCurrentClusterItems(clusterIds)
                    }
                </div>
            </Draggable>
        )
    }
}
