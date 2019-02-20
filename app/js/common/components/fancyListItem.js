import React from 'react';

export default class FancyListItem extends React.PureComponent {

    render() {
        const {children, keyId, className, actions, icon, category } = this.props

        return (
            <li
                className={`fancylist-item ${className}`}
                key={keyId}
            >
                {icon && <span className="fancylist-item-icon"><img src={icon}/></span>}
                <span className="fancylist-item-title">{children}</span>
                {category && 
                    <span className="fancylist-item-category">{category}</span>
                }
                {actions && <span className="fancylist-item-actions">{actions}</span>}
            </li>
        );
    }
}
