import React from 'react';
import {Link, generatePath} from 'react-router';
import {connect} from 'react-redux';
import {fn} from 'app/utils';
import { url } from 'app/constants';
import { makeGetGroup } from 'app/containers/group/selector';

@connect((state, ownProps) => {
    const getGroup = makeGetGroup();

    return {
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class Popup extends React.PureComponent {

    nextLink = () => {
      const {params, location} = this.props

      if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]/)){
        return `/projects/${params.id}/groups/${params.groupId}/organisations`
      } else if (location.pathname.match(/^\/projects\/[0-9]*\/groups/)) {
          return `/projects/${params.id}`
      } else if (location.pathname.match(/^\/projects\/[0-9]*/)) {
          return `/projects/${params.id}/groups`
      } else if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]\/edit/)){

      }
    }

    handleOnChange = (name, value) => {
      const { params } = this.props

      if(value !== params.groupId) {
          fn.navigate(`/${url.projects}/${params.id}/${url.groups}/${value}`)
      }
    }

    render() {
        const { project, location, group, groups, params } = this.props

        return (
            <div className="nav">
                {params.groupId ? (
                  <React.Fragment>
                    <Link
                      to={this.nextLink}
                      className="nav-link"
                    >
                      {group.title}
                    </Link>
                    {/*<Link to={this.nextLink} className="icon-hamburger"/>*/}
                  </React.Fragment>
                ) : (
                    <Link to={this.nextLink} className="icon-stack"/>
                )}
            </div>
        );
    }
}
