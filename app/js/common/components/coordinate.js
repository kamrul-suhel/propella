import React from 'react'
import Propstype from 'prop-types'

export default class Coordinate extends React.PureComponent {
    state = {
        coordinates: []
    }

    render() {
        const {coordinates} = this.props;

        return (
            coordinates && _.map(coordinates, (coordinate) => {
                return (
                    <div className="selected-group-wrapper progress-button" key={coordinate.id} 
                    style={{top:`${coordinate.positionX}%`, left:`${coordinate.positionY}%`}} >            
                        <div class="connector" style={{transform:"rotate(101deg)", height:'41VH'}}></div>
                        <p><img src={coordinate.icon_path}/></p>                        
                    </div>
                )
            })
        )
    }
}