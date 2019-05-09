import React from 'react'
import Draggable from "react-draggable";
import {fn} from 'app/utils'

export default class Cluster extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showSelectedClusterItem: null,
            selectedCluster: []
        }
    }

    render() {
        const {
            clusters,
            clusterIds,
            item,
            itemType
        } = this.props

        {
            _.map(clusters, (cluster, i) => {
                    // get first group for cluster icon
                    let item = _.find(item[itemType], (item) => {
                        return item.id === clusterIds[0]
                    })

                    if (showSelectedClusterItem && clusterIds.includes(showSelectedClusterItem)) {
                        return;
                    }

                    const isShow = fn.isItemShow(group, location);
                    if (!isShow) {
                        return;
                    }
                    const position = fn.getPosition(group, location);

                    return (
                        <Draggable
                            key={group.id}
                            axis="none"
                            handle=".react-draggable-handle"
                            defaultPosition={{
                                x: position.positionX,
                                y: position.positionY
                            }}
                            grid={[10, 10]}
                            scale={1}
                            bounds=".gridwrapper-inner-section-wrapper"
                            onStop={this.onClusterEventHandler}
                        >

                            <div handleid={clusterIds}
                                 className={
                                     [
                                         `size-${group.icon_size}`,
                                         (selectedDraggable && selectedDraggable !== group.id ? 'disabled' : ''),
                                         (selectedDraggable === group.id ? 'is-selected' : ''),
                                         group
                                     ]
                                 }
                            >
                                <div className="react-draggable-handle">
                                    {group.icon_path ? (
                                        <img className="react-draggable-handle-icon"
                                             src={`${group.icon_path}`}/>
                                    ) : (
                                        <div className="react-draggable-handle-title">CTI</div>
                                    )}
                                    <span className="user-colour-dot"
                                          style={{backgroundColor: group.profile_colour}}></span>
                                </div>
                                <span className="react-draggable-title">Cluster</span>

                                {_.join(selectedCluster, ',') === _.join(clusterIds, ',') &&
                                this.renderCurrentClusterItems(clusterIds)
                                }
                            </div>
                        </Draggable>
                    )
                }
            )
        }
    }
}