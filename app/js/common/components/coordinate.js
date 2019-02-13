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
                    <div className="selected-group-wrapper" key={coordinate.id}>
                        <p>id: {coordinate.id}</p>
                        <p>{coordinate.positionX}</p>
                        <p>{coordinate.positionY}</p>
                        <p><img src={coordinate.icon_path}/></p>
                        <p>Icon size: {coordinate.icon_size}</p>
                    </div>
                )
            })
        )
    }
}