import React from 'react';

export default class FancyListItem extends React.PureComponent {

    render() {
        const {children, keyId, className, actions, icon, iconPath} = this.props

        return (
            <li
                className={`fancylist-item ${className}`}
                key={keyId}
            >                
                {iconPath && <span className="fancylist-item-icon"><img src={iconPath}/></span>}

                <span className="fancylist-item-title">{children}</span>

                {actions && <span className="fancylist-item-actions">{actions && actions}</span>}
            </li>
        );
    }
}
