import React from 'react'
import {fn} from 'app/utils';

export default class Coordinate extends React.PureComponent {
    getDegreeRotate(currentCoordinate, nextCoordinate) {
        const { location } = this.props

        let angleDeg = 0
        let c = 0

        if (nextCoordinate) {

            const cPosition = fn.getPosition(currentCoordinate, location)
            const nPosition = fn.getPosition(nextCoordinate, location)

            // angle in degrees
            angleDeg = Math.atan2(cPosition.positionY - nPosition.positionY, cPosition.positionX - nPosition.positionX) * 180 / Math.PI

            // Distance between 2 points
            let a = cPosition.positionX - nPosition.positionX
            let b = cPosition.positionY - nPosition.positionY

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
        const { location } = this.props

        const itemPosition = fn.getPosition(group, location)

        return (
            <div className={`selected-group-wrapper first-coordinate progress-button size-${group.icon_size}`}
                 style={{transform: `translate(${itemPosition.positionX}px, ${itemPosition.positionY}px)`}}>
                <div className="connector" style={{
                    transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                    width: `${position.height ? position.height : 0}px`
                }}></div>
            </div>
        )
    }

    renderCoordinate(group) {
        const { location } = this.props
        return (
            group.coordinates && _.map(group.coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = group.coordinates[index + 1] && group.coordinates[index + 1]
                const position = this.getDegreeRotate(coordinate, nextCoordinate)
                const itemPosition = fn.getPosition(coordinate, location)
                return (
                    <div key={coordinate.id}
                         id={coordinate.id}
                         className={`selected-group-wrapper progress-button coordinate size-${coordinate.icon_size} coordinate-${index}`}
                         style={{transform: `translate(${itemPosition.positionX}px, ${itemPosition.positionY}px)`}}>
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
