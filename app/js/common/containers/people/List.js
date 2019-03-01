import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader} from '@xanda/react-components';
import {Popup, FancyList, FancyListItem} from 'app/components';
import {api, fn} from 'app/utils';
import {url} from 'app/constants';
import { makeGetGroup, makeGetGroups } from 'app/containers/group/selector';
import PeopleWrapper from './Wrapper';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class List extends React.PureComponent {
  fetchData = () => {
    this.props.dispatch(fetchData({
        type: 'GROUP',
        url: `/groups/${this.props.params.groupId}`,
    }));
  }

  handleDelete = async (groupId, personId) => {
      if (window.confirm("Are you sure you want to delete this person?")) {
          const response = await api.delete(`people/${personId}`)
          if (!api.error(response)) {
              this.fetchData()
          }
      }
  }

  renderItem = (person) => {
      if (!person) {
          return
      }

      const character = fn.getPeopleCharacter(parseInt(person.character_id))

      return (
          <FancyListItem
            key={person.id}
            actions={
              <React.Fragment>
                <Link
                to={`/${url.projects}/${this.props.params.id}/${url.groups}/${this.props.params.groupId}/${url.people}/${person.id}`}
                className="icon-pencil"
                />
                <span type="button" onClick={() => this.handleDelete(this.props.params.groupId, person.id)} className="clickable icon-bin" />
                {person.character_id &&
                  <span type="button" class={character['iconImage']} title={character['title']}></span>
                }
            </React.Fragment>
            }
            category={person.organisation_title}
          >
              {person.title}
          </FancyListItem>
      )
    }

  render() {
    const {groups, group, params} = this.props

    return (
        <PeopleWrapper {...this.props}>
          <Popup
              beforeTitle={<Link
                  to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}`}>Organisations</Link>}
              title="People"
              buttons={
                  <React.Fragment>
                      {!_.isEmpty(group.people) &&
                      <Link className="button"
                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add`}>Add
                          person</Link>
                      }
                  </React.Fragment>
              }
              additionalClass="people"
              hide
          >
              <ContentLoader
                  data={groups.collection}
                  isLoading={groups.isLoading}
              >
                  {_.isEmpty(group.people) ? (
                      <Link className="button" to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add`}>Add
                          your first person <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
                  ) : (
                      <React.Fragment>
                          <FancyList>
                            <li class="fancylist-item undefined">
                            <span class="fancylist-item-title">Name</span>
                            <span class="fancylist-item-category">ORG</span>
                            <span class="fancylist-item-actions"></span>
                            </li>
                              {_.map(group.people, (person) => {
                                  return this.renderItem(person)
                              })}
                          </FancyList>
                      </React.Fragment>
                  )}
              </ContentLoader>
          </Popup>
        </PeopleWrapper>
    );
  }
}
