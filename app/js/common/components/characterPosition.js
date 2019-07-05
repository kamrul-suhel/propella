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
        const characterColor = fn.getPeopleColorClass(selectedCh, location)

        return (
            <div className="character-pos">
                <div className="gridwrapper-y">
                    <span className="axis-image"/>
                    <div className="top-icon">
                        <span className="icon-slide-icon-crown"/>
                        <p>{100}</p>
                    </div>
                    <div className="bottom-icon">
                        <p>{100}</p>
                        <span className="icon-slide-icon-jester"/>
                    </div>
                    <p className="axis-label">Royalty</p>
                </div>

                <div className="character-pos-content">
                    <div className="gridwrapper-inner-section-wrapper">
                        <span className="gridwrapper-inner-section">Upgraders</span>
                        <span className="gridwrapper-inner-section">VIP</span>
                        <span className="gridwrapper-inner-section">No Frills</span>
                        <span className="gridwrapper-inner-section">Standard</span>
                    </div>

                    <div className={`character-pos-icon ${characterColor}`}
                         style={{
                             top: `${position.positionY }px`,
                             left: `${position.positionX}px`
                         }}>
                        <span className={`person-icon ${fn.getPeopleCharacter(selectedCharacter.id)['iconImage']}`}></span>
                    </div>
                </div>

                <div className="gridwrapper-x">
                    <span className="axis-image"/>
                    <div className="left-icon">
                        <span className="icon-slide-icon-hate"/>
                        <p>100</p>
                    </div>
                    <div className="right-icon">
                        <p>100</p>
                        <span className="icon-slide-icon-love"/>
                    </div>
                    <p className="axis-label">Loyalty</p>
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