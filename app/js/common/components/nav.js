import React from "react";
import { Link } from "react-router";
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import { fn } from "app/utils";
import { url } from "app/constants";
import { makeGetGroup } from "app/containers/group/selector";
import { makeGetMenu } from "app/reducers/menu";

@connect((state, ownProps) => {
  const getGroup = makeGetGroup();
  const getMenu = makeGetMenu();

  return {
    group: getGroup(state, ownProps.params.groupId),
    me: state.me,
    menu: getMenu(state)
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
      return `/projects/${params.id}/groups/${params.groupId}/people`;
    } else if (
      location.pathname.match(
        /^\/projects\/[0-9]*\/groups\/[0-9]*\/organisations/
      )
    ) {
      return `/projects/${params.id}/groups/${params.groupId}`;
    } else if (
      location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]*\/people/)
    ) {
      return `/projects/${params.id}/groups/${
        params.groupId
      }/organisations/people`;
    } else if (location.pathname.match(/^\/projects\/[0-9]*\/groups\/[0-9]/)) {
      return `/projects/${params.id}/groups/${params.groupId}/organisations`;
    } else if (location.pathname.match(/^\/projects\/[0-9]*\/groups/)) {
      return `/projects/${params.id}`;
    } else if (location.pathname.match(/^\/projects\/[0-9]*/)) {
      return `/projects/${params.id}/groups`;
    } else if (
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
    const { project, location, group, groups, params, menu } = this.props;
    const user = fn.getUser();

    // check if already on a report page
    const activeReport = location.pathname.match(/(\/report)/);
    const menuClass = this.state.menuOpen ?'is-open-menu' : ''

    return (
      <div className="nav">
        <img className="nav-logo" src="/../../../images/logo.svg" />
        {params.groupId && location.pathname.match(/(\/organisations|\/people|\/\groups\/[0-9]+)/) ? (
          <React.Fragment>
            <Link to={this.nextLink} className="nav-link">
              {group.title}
            </Link>
            <Link
              to={`/${url.projects}/${params.id}`}
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
        <div className="menu">{user && <p>Hi, {user.display_name}!</p>}</div>
        <span className="hamburger clickable" onClick={this.handleToggleMenu} title="Menu">
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
            <a href={`${url.wordpress}/wp-login.php?action=logout&amp;redirect_to=%2Flogin&amp;_wpnonce=6811e8790b`}>
              Log out {user.display_name}
            </a>
          </div>
          {!_.isEmpty(menu.collection) &&
            <ul id="menu-main-menu" className="main">
              {_.map(menu.collection, (item) => (
                <li
                  key={item.ID}
                  className={`menu-item`}
                >
                  <a href={item.url}>{item.title}</a>
                </li>
              ))}
            </ul>
          }
        </nav>
      </div>
    );
  }
}
