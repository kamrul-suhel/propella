import React from 'react'
import Propstype from 'prop-types'

export default class Coordinate extends React.PureComponent {
    state = {}

    getDegreeRotate(currentCoordinate, nextCoordinate) {
        let angleDeg = 0;
        let c = 0;

        if (nextCoordinate) {
            // angle in degrees
            angleDeg = Math.atan2(currentCoordinate.positionY - nextCoordinate.positionY, currentCoordinate.positionX - nextCoordinate.positionX) * 180 / Math.PI;
            angleDeg = Math.floor(angleDeg);

            // Change Positive Number to Negative Number
            if (Math.sign(angleDeg) === 1) {
                angleDeg = Math.abs(angleDeg) * -1;
            } else {
                angleDeg = Math.abs(angleDeg);
            }

            // Distance between 2 points
            let a = currentCoordinate.positionX - nextCoordinate.positionX;
            let b = currentCoordinate.positionY - nextCoordinate.positionY;

            c = Math.sqrt(a * a + b * b);
        }

        return {
            degree: angleDeg,
            height: c
        }
    }

    renderRootCoordinate(position) {
        return (
            <div className="connector" style={{
                transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                height: `${position.height ? position.height : 0}VH`
            }}></div>
        )
    }

    renderCoordinate(group) {
        return (
            group.coordinates && _.map(group.coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = group.coordinates[index + 1] && group.coordinates[index + 1];
                const position = this.getDegreeRotate(coordinate, nextCoordinate);
                return (
                    <div key={coordinate.id}
                         className="selected-group-wrapper progress-button"
                         style={{top: `${coordinate.positionX}%`, left: `${coordinate.positionY}%`}}>
                        <div className="connector" style={{
                            transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                            height: `${position.height ? position.height : 0}VH`
                        }}></div>
                        <p><img src={coordinate.icon_path}/></p>
                    </div>
                )
            })
        )
    }

    render() {
        const {group} = this.props;

        const firstCoordinate = group.coordinates[0] && group.coordinates[0];
        const rootConnector = this.getDegreeRotate(group, firstCoordinate);

        return (
            <React.Fragment>
                {this.renderRootCoordinate(rootConnector)}
                {this.renderCoordinate(group)}
            </React.Fragment>
        )
    }
}