import React from 'react'
import Propstype from 'prop-types'

export default class Coordinate extends React.PureComponent {
    state = {
        coordinates: []
    }

    render() {
        const {coordinates} = this.props;

        return (
            coordinates && _.map(coordinates, (coordinate, index) => {
                // Next coordinate
                const nextCoordinate = coordinates[index+1] && coordinates[index+1];
                let angleDeg = 0;
                let c = 0;

                if(nextCoordinate){
                    console.log('Next coordinate', nextCoordinate);
                    // angle in radians
                    let angleRadians = Math.atan2(nextCoordinate.positionY - coordinate.positionY, nextCoordinate.positionX - coordinate.positionX);
                    angleRadians = Math.floor(angleRadians);

                    // angle in degrees
                    angleDeg = Math.atan2(coordinate.positionY - nextCoordinate.positionY, coordinate.positionX - nextCoordinate.positionX) * 180 / Math.PI;
                    angleDeg = Math.floor(angleDeg);

                    if(Math.sign(angleDeg) === 1){
                        angleDeg = Math.abs(angleDeg) * -1;
                    }else {
                        angleDeg = Math.abs(angleDeg);
                    }

                    // Distance between 2 points
                    let a = coordinate.positionX - nextCoordinate.positionX;
                    let b = coordinate.positionY - nextCoordinate.positionY;

                    c = Math.sqrt( a*a + b*b );

                    console.log('angle in degrees : ', angleRadians);
                    console.log('distance between : ', c);
                }

                return (
                    <div key={coordinate.id}
                         className="selected-group-wrapper progress-button"
                         style={{top: `${coordinate.positionX}%`, left: `${coordinate.positionY}%`}}>
                        <div className="connector" style={{transform: `rotate(${angleDeg ? angleDeg : 0}deg)`, height: `${c ? c : 0}VH`}}></div>
                        <p><img src={coordinate.icon_path}/></p>
                    </div>
                )
            })
        )
    }
}