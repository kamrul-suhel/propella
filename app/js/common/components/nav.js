import React from "react";
import { Link } from "react-router";
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import { fn } from "app/utils";
import { url } from "app/constants";
import { makeGetGroup, makeGetGroups } from "app/containers/group/selector";
import { makeGetMenu } from "app/reducers/menu";

@connect((state, ownProps) => {
  const getGroups = makeGetGroups();
  const getGroup = makeGetGroup();
  const getMenu = makeGetMenu();

  return {
    groups: getGroups(state),
    group: getGroup(state, ownProps.params.groupId),
    me: state.me,
    menu: getMenu(state),
    project: state.project
  };
})
export default class Nav extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false
    };
  }
  componentDidMount() {
      this.fetchData();
  }

  fetchData = async () => {
    this.props.dispatch(fetchData({
        type: 'MENU',
        url: `${url.wordpress}/wp-admin/admin-ajax.php?action=get_menu`,
    }));
  }

  nextLink = () => {
    const { params, location } = this.props;

    if (
      location.pathname.match(
        /^\/projects\/[0-9]*\/groups\/[0-9]*\/organisations\/people/
      )
    ) {
      let link = `/projects/${params.id}/groups/${params.groupId}/people`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link
    }

    else if (
      location.pathname.match(
        /^\/projects\/[0-9]*\/groups\/[0-9]*\/organisations/
      )
    ) {
      let link = `/projects/${params.id}/groups/${params.groupId}`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link
    }

    else if (
      location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]*\/people/)
    ) {
      let link = `/projects/${params.id}/groups/${params.groupId}/organisations/people`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link
    }

    else if (location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]/)) {
      let link = `/projects/${params.id}/groups/${params.groupId}/organisations`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link;
    }

    else if (location.pathname.match(/^\/projects\/[0-9]*\/groups/)) {
      let link = `/projects/${params.id}`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link
    }

    else if (location.pathname.match(/^\/projects\/[0-9]*/)) {
      let link = `/projects/${params.id}/groups`
      return location.query.zoom ? `${link}/zoom?zoom=${location.query.zoom}` : link;
    }

    else if (
      location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]\/edit/)
    ) {
    }

    return "/";
  };

  reportLink = () => {
    const { params, location } = this.props;

    return location.pathname.match(/(\/people)/) ? `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/people/${url.report}` : `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.report}`;
  };

  closeReportLink = () => {
    const { params, location } = this.props;

    return location.pathname.match(/(\/organisations\/report)/) ? `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}` : `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.people}`
  };

  handleOnChange = (name, value) => {
    const { params, location } = this.props;

    if (value !== params.groupId) {
      fn.navigate(`/${url.projects}/${params.id}/${url.groups}/${value}`);
    }
  };

  handleToggleMenu = () => {
    const newMenuState = this.state.menuOpen ? false : true
    this.setState({menuOpen: newMenuState})
  }

  render() {
    const { menuOpen } = this.state
    const { project, location, group, groups, params, menu } = this.props
    const currentProject = project.collection[params.id] && project.collection[params.id]

    const user = fn.getUser();

    // check if already on a report page
    const activeReport = location.pathname.match(/(\/report)/);
    const menuClass = this.state.menuOpen ?'is-open-menu' : ''
    const burgerClass = this.state.menuOpen ?'is-active' : ''
    const projectUrl = location.query.zoom ? `/${url.projects}/${params.id}` : `/${url.projects}/${params.id}`

    return (

      <div className="nav" id="nav" style={{zIndex: menuOpen ? 102 : 101}}>
        <img className="nav-logo" src="/../../../images/logo.svg" />

        <h2 className="project-title">{currentProject && currentProject.title}</h2>

        {params.id &&
          <React.Fragment>
          {group.title && params.groupId && location.pathname.match(/(\/organisations|\/people|\/\groups\/[0-9]+)/) ? (
            <React.Fragment>
              <Link to={this.nextLink} className="nav-link">
                {group.title}
              </Link>
              <Link
                to={projectUrl}
                className="nav-close icon-x-small"
                title="Back to All Groups"
              />
              {activeReport ? (
                <Link to={this.closeReportLink} className="icon-toggled" title="View Grid" />
              ) : (
                <Link to={this.reportLink} className="icon-normal" title="Download Report"/>
              )}
            </React.Fragment>
          ) : (
            <Link to={this.nextLink} className="icon-stack" />
          )}
          </React.Fragment>
        }
        <div className="menu">{user && <p>Hi, {user.display_name}!</p>}</div>
        <span className={`hamburger clickable ${burgerClass}`} onClick={this.handleToggleMenu} title="Menu">
          <span className="line-1" />
          <span className="line-2" />
          <span className="line-3" />
        </span>
        <nav
          id="main-nav"
          className={`main-nav ${menuClass}`}
          role="navigation"
          aria-label="Main Navigation"
        >
          <div className="header-greeting">
            <a href={`${url.wordpress}/wp-login.php?action=logout`}>
              Log out {user.display_name}
            </a>
          </div>
          {!_.isEmpty(menu.collection) &&
            <ul id="menu-main-menu" className="main">
              {_.map(menu.collection, (item) => (
                <li
                  key={item.ID}
                  className={
                    'menu-item ' +
                    (item.ID === 268 ? 'border' : '')
                  }
                >
                  <a className={
                    (item.ID === 265 || item.ID === 264 ? 'text-normal' : '')
                  }
                     href={item.url}>{item.title}</a>
                </li>
              ))}
            </ul>
          }
        </nav>
      </div>
    );
  }
}
