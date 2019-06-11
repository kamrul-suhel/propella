import React from 'react';
import { fn } from "app/utils"

export default class CharacterPosition extends React.PureComponent {

    render() {
        const {location, selectedCharacter} = this.props
        const selectedCh = {
            ...selectedCharacter.defaultCoordinates,
            icon_size: 'm'
        }
        const position = fn.getPosition(selectedCh, location)

        return (
            <div className="character-pos">
                <div className="character-pos-content">

                    <div className="gridwrapper-inner-section-wrapper">
                        <span className="gridwrapper-inner-section">Upgraders</span>
                        <span className="gridwrapper-inner-section">VIP</span>
                        <span className="gridwrapper-inner-section">No Frills</span>
                        <span className="gridwrapper-inner-section">Standard</span>
                    </div>

                    <div className="character-pos-icon"
                         style={{
                             top: `${position.positionY + 80}px`,
                             left: `${position.positionX + 40}px`
                         }}></div>
                    {/*<img src={"/images/character-bg.jpg"}/>*/}
                </div>

                <div className="character-pos-footer">
                    <a href="#"
                       className="btn-character-close"
                       onClick={(event) => this.props.handleCloseCharacterPosBox(event)}>
                        <div className="character-close-icon">X</div>
                        Close
                    </a>
                </div>
            </div>
        )
    }
}