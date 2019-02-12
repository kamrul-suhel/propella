import React from 'react';

export default class FancyListItem extends React.PureComponent {

    render() {
        const {children, key, className, actions, icon, iconPath} = this.props

        return (
            <li
                className={`fancylist-item ${className}`}
                key={key}
            >
                {icon && <span className="fancylist-item-icon-size">{icon}</span>}

                {iconPath && <span className="fancylist-item-icon-path"><img src={iconPath}/></span>}

                <span className="fancylist-item-title">{children}</span>

                {actions && <span className="fancylist-item-actions">{actions && actions}</span>}
            </li>
        );
    }
}
