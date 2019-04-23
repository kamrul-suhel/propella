import React from 'react';

export default class Overview extends React.PureComponent {

    render() {
        const {positionX, positionY, icon, title, icon_path, icon_size, abbreviation, id} = this.props

        return (
            <div className="overview">
                <div className="ov-message">
                    <p>Great, you're ready to {id && id ? `update ${title}` : 'add a' } group!</p>
                </div>

                <p className="ov-title h2">
                    {title}
                </p>

                <div className="ov-img-content">
                    <div className="ov-icon-path">
                    {icon || icon_path ? (
                      <img src={icon ? icon.preview : icon_path}/>
                    ) : (
                      <p className="ov-abbreviation">{abbreviation}</p>
                    )}
                    <div className="ov-icon-size">{icon_size}</div>
                    </div>
                </div>
                <div className="ov-scores">
                <div className="royalty-wrapper">
                    <p>Royalty</p>
                    <span>{_.round(positionY)}</span>
                </div>
                <div className="loyalty-wrapper">
                    <p>Loyalty</p>
                    <span>{_.round(positionX)}</span>
                </div>
                </div>
            </div>
        );
    }
}
