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

      if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]*\/organisations\/people/)){
        return `/projects/${params.id}/groups/${params.groupId}/people`
      } else if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]*\/organisations/)){
        return `/projects/${params.id}/groups/${params.groupId}`
      } else if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]*\/people/)){
        return `/projects/${params.id}/groups/${params.groupId}/organisations/people`
      } else if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]/)){
        return `/projects/${params.id}/groups/${params.groupId}/organisations`
      } else if (location.pathname.match(/^\/projects\/[0-9]*\/groups/)) {
          return `/projects/${params.id}`
      } else if (location.pathname.match(/^\/projects\/[0-9]*/)) {
          return `/projects/${params.id}/groups`
      } else if(location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]\/edit/)){

      }
    }

    reportLink = () => {
      const { params } = this.props

      if(params.organisationId) {
        return `/projects/${params.id}/groups/${params.groupId}/organisation/${url.report}`
      }
      return `/projects/${params.id}/groups/${params.groupId}/people/${url.report}`
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
                    <Link to={`/${url.projects}/${params.id}`} className="nav-close icon-x-small"/>
                    <Link to={this.reportLink} className="icon-normal"/>
                  </React.Fragment>
                ) : (
                    <Link to={this.nextLink} className="icon-stack"/>
                )}
            </div>
        );
    }
}
