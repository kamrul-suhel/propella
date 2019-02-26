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

      return '/'
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
                <img className="nav-logo" src="/../../../images/logo.svg"/>
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
                <div className="menu">
                    <p>Hi, Will!</p>
                </div>
                <a className="hamburger" href="#" title="Menu">
                        <span className="line-1"></span>
                        <span className="line-2"></span>
                        <span className="line-3"></span>
                </a>
                <nav id="main-nav" className="main-nav" role="navigation" aria-label="Main Navigation">
                    <div className="header-greeting">
                        <a href="http://propella.hostings.co.uk/wp-login.php?action=logout&amp;redirect_to=%2Flogin&amp;_wpnonce=6811e8790b">Log out Will</a>
                    </div>
                    <ul id="menu-main-menu" className="main"><li id="menu-item-47" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-47"><a href="http://propella.hostings.co.uk/dashboard/">Dashboard</a></li>
                        <li id="menu-item-46" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-46"><a href="http://propella.hostings.co.uk/archive/">Archive</a></li>
                        <li id="menu-item-44" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-44"><a href="http://propella.hostings.co.uk/faqs/">FAQS</a></li>
                        <li id="menu-item-162" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-162"><a href="http://propella.hostings.co.uk/user-settings/">User Settings</a></li>
                        <li id="menu-item-48" className="menu-item menu-item-type-post_type menu-item-object-page current-menu-item page_item page-item-9 current_page_item menu-item-48"><a href="http://propella.hostings.co.uk/step-1/">Tutorial</a></li>
                    </ul>
                </nav>
            </div>
        );
    }
}