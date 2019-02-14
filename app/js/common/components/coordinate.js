import React from 'react'
import Propstype from 'prop-types'

export default class Coordinate extends React.PureComponent {
    state = {}

    getDegreeRotate(currentCoordinate, nextCoordinate) {
        let angleDeg = 0;
        let c = 0;
        console.log("current coordinate : ", currentCoordinate);
        console.log("next coordinate : ", nextCoordinate);

        if (nextCoordinate) {
            // angle in degrees
            angleDeg = Math.atan2(currentCoordinate.positionY - nextCoordinate.positionY, currentCoordinate.positionX - nextCoordinate.positionX) * 180 / Math.PI;

            // Change Positive Number to Negative Number
            // if (Math.sign(angleDeg) === 1) {
            //     angleDeg = Math.abs(angleDeg) * -1;
            // } else {
            //     angleDeg = Math.abs(angleDeg);
            // }

            console.log('Angle degree : ', angleDeg);

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

    renderRootCoordinate(group, position) {
        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0

        return (
            <div className="selected-group-wrapper first-coordinate progress-button"
                 style={{transform: `translate(${containerWidth / 100 * group.positionX}px, ${containerHeight / 100 * group.positionY}px)`}}>
                <div className="connector" style={{
                    transform: `rotate(${position.degree ? 360 - position.degree : 0}deg)`,
                    width: `${position.height ? position.height : 0}VH`
                }}></div>
            </div>
        )
    }

    renderCoordinate(group) {
        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0
        return (
            group.coordinates && _.map(group.coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = group.coordinates[index + 1] && group.coordinates[index + 1];
                const position = this.getDegreeRotate(coordinate, nextCoordinate);
                return (
                    <div key={coordinate.id}
                         className="selected-group-wrapper progress-button"
                         style={{transform: `translate(${containerWidth / 100 * coordinate.positionX}px, ${containerHeight / 100 * coordinate.positionY}px)`}}>
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
                {this.renderRootCoordinate(group, rootConnector)}
                {this.renderCoordinate(group)}
            </React.Fragment>
        )
    }
}