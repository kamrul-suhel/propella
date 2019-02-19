import React from 'react'
import Propstype from 'prop-types'

export default class Coordinate extends React.PureComponent {
    getDegreeRotate(currentCoordinate, nextCoordinate) {
        let angleDeg = 0
        let c = 0
        const container = this.getContainer()

        if (nextCoordinate) {
            const cPositionX = container.width / 100 * currentCoordinate.positionX
            const cPositionY = container.height / 100 * currentCoordinate.positionY
            const nPositionX = container.width / 100 * nextCoordinate.positionX
            const nPositionY = container.height / 100 * nextCoordinate.positionY

            // angle in degrees
            angleDeg = Math.atan2(cPositionY - nPositionY, cPositionX - nPositionX) * 180 / Math.PI

            console.log('Angle degree : ', angleDeg)

            // Distance between 2 points
            let a = cPositionX - nPositionX
            let b = cPositionY - nPositionY

            c = Math.sqrt(a * a + b * b)
        }

        return {
            degree: angleDeg,
            height: c
        }
    }

    getContainer = () => {
        const container = document.getElementById('gridwrapper-inner')
        const containerHeight = (container || {}).offsetHeight || 0
        const containerWidth = (container || {}).offsetWidth || 0
        return {
            height: containerHeight,
            width: containerWidth
        }
    }

    renderRootCoordinate(group, position) {
        const container = this.getContainer()

        return (
            <div className="selected-group-wrapper first-coordinate progress-button"
                 style={{transform: `translate(${container.width / 100 * group.positionX}px, ${container.height / 100 * group.positionY}px)`}}>
                <div className="connector" style={{
                    transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                    width: `${position.height ? position.height : 0}px`
                }}></div>
            </div>
        )
    }

    renderCoordinate(group) {
        const container = this.getContainer();
        return (
            group.coordinates && _.map(group.coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = group.coordinates[index + 1] && group.coordinates[index + 1]
                const position = this.getDegreeRotate(coordinate, nextCoordinate)
                return (
                    <div key={coordinate.id}
                         id={coordinate.id}
                         className={`selected-group-wrapper progress-button coordinate-${index}`}
                         style={{transform: `translate(${container.width / 100 * coordinate.positionX}px, ${container.height / 100 * coordinate.positionY}px)`}}>
                        <div className="connector" style={{
                            transform: `rotate(${position.degree ? position.degree : 0}deg)`,
                            width: `${position.height ? position.height : 0}px`
                        }}></div>                        
                        <img class="progress-button-img" src={coordinate.icon_path}/>                        
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