import React from 'react'
import {fn} from 'app/utils';

export default class Coordinate extends React.PureComponent {
    getDegreeRotate(currentCoordinate, nextCoordinate) {
        let angleDeg = 0
        let c = 0
        const container = fn.getContainer()

        if (nextCoordinate) {
            const cPositionX = container.width / 100 * currentCoordinate.positionX
            const cPositionY = container.height- (container.height / 100 * currentCoordinate.positionY)
            const nPositionX = container.width / 100 * nextCoordinate.positionX
            const nPositionY = container.height - (container.height / 100 * nextCoordinate.positionY)

            // angle in degrees
            angleDeg = Math.atan2(cPositionY - nPositionY, cPositionX - nPositionX) * 180 / Math.PI

            // Distance between 2 points
            let a = cPositionX - nPositionX
            let b = cPositionY - nPositionY

            c = Math.sqrt(a * a + b * b)

            switch(nextCoordinate.icon_size){
                case 's':
                    c = c - 20;
                    break;
                case 'm':
                    c = c -20;
                    break;
                case 'l':
                    c = c;
                    break;
                default:
                    c;
            }
        }

        return {
            degree: angleDeg,
            height: c
        }
    }

    renderRootCoordinate(group, position) {
        const container = fn.getContainer()

        return (
            <div className={`selected-group-wrapper first-coordinate progress-button size-${group.icon_size}`}
                 style={{transform: `translate(${container.width / 100 * group.positionX}px, ${container.height - (container.height / 100 * group.positionY)}px)`}}>
                <div className="connector" style={{
                    transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                    width: `${position.height ? position.height : 0}px`
                }}></div>
            </div>
        )
    }

    renderCoordinate(group) {
        const container = fn.getContainer();
        return (
            group.coordinates && _.map(group.coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = group.coordinates[index + 1] && group.coordinates[index + 1]
                const position = this.getDegreeRotate(coordinate, nextCoordinate)
                return (
                    <div key={coordinate.id}
                         id={coordinate.id}
                         className={`selected-group-wrapper progress-button coordinate size-${coordinate.icon_size} coordinate-${index}`}
                         style={{transform: `translate(${container.width / 100 * coordinate.positionX}px, ${container.height - (container.height / 100 * coordinate.positionY)}px)`}}>
                        <div className="connector" style={{
                            transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                            width: `${position.height ? position.height : 0}px`
                        }}></div>
                        <img className="progress-button-img" src={coordinate.icon_path}/>
                    </div>
                )
            })
        )
    }

    render() {
        const {group} = this.props

        const firstCoordinate = group.coordinates[0] && group.coordinates[0]
        const rootConnector = this.getDegreeRotate(group, firstCoordinate)

        return (
            <React.Fragment>
                {this.renderRootCoordinate(group, rootConnector)}
                {this.renderCoordinate(group)}
            </React.Fragment>
        )
    }
}
