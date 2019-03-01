import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader} from '@xanda/react-components';
import {FancyList, FancyListItem, Popup} from 'app/components';
import {api} from 'app/utils';
import {url} from 'app/constants';
import {makeGetGroup, makeGetGroups} from 'app/containers/group/selector';
import { GroupWrapper } from 'app/containers/group';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class List extends React.PureComponent {
  fetchData = async () => {
      await this.props.dispatch(fetchData({
          type: 'GROUP',
          url: `/groups/${this.props.params.groupId}`,
      }));

      if(_.isEmpty(this.state.groups.collection)){
        fn.navigate(`/${url.projects}/${this.props.params.id}/${url.organisations}`)
      }
  }

  handleStatusChange = async (organisation, newStatus) => {
      // check status has changed
      const status = newStatus === "1" ? 1 : 0
      if (organisation.status !== status) {
          const response = await api.put(`organisations/${organisation.id}`, {status: status})
          if (!api.error(response)) {
              this.fetchData()
          }
      }
  }

  handleDelete = async (groupId, organisationId) => {
      if (window.confirm("Are you sure you want to delete this organisation?")) {
          const response = await api.delete(`organisations/${organisationId}`)
          if (!api.error(response)) {
              this.fetchData()
          }
      }
  }

  renderItem = (organisation) => {
      if (!organisation) {
          return
      }

      const {params} = this.props

      return (
          <FancyListItem
              key={organisation.id}
              keyId={organisation.id}
              className={(organisation.status === 1) ? `is-active` : `is-inactive`}
              actions={
                  <React.Fragment>
                      <Checkbox
                          name="status"
                          value={organisation.status}
                          options={[
                              {
                                  id: 1,
                                  title: 'Visible'
                              }
                          ]}
                          onChange={(name, value) => this.handleStatusChange(organisation, value)}
                          styled
                          className="switch"
                      />
                      <Link
                          to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${organisation.id}`}
                          className="icon-pencil"
                      />
                      <Link
                          to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add?organisation_id=${organisation.id}`}
                          className="icon-add-people"
                      />
                      <span
                        className="clickable icon-bin"
                        type="button"
                        onClick={() => this.handleDelete(params.groupId, organisation.id)}>
                      </span>
                  </React.Fragment>
              }
          >
              {organisation.title}
          </FancyListItem>
      )
  }

  render() {
      const {groups, group, params} = this.props

      return (
          <GroupWrapper {...this.props}>
            <Popup
                title="Organisations"
                afterTitle={<Link
                to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`}>People</Link>}
                buttons={
                  <React.Fragment>
                    {!_.isEmpty(group.organisations) &&
                      <React.Fragment>
                          <Link
                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/add`}
                            className="button"
                          >Add organisation</Link>
                          <Link
                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`}
                            className="button"
                          >View People</Link>
                      </React.Fragment>
                    }
                  </React.Fragment>
                }
                additionalClass="organisations window-large"
            >
                <ContentLoader
                    data={groups.collection}
                    isLoading={groups.isLoading}
                >
                    {_.isEmpty(group.organisations) ? (
                        <Link className="button"
                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/add`}>Add
                            your first organisation <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
                    ) : (
                        <FancyList>
                            {_.map(group.organisations, (organisation) => this.renderItem(organisation))}
                        </FancyList>
                    )}
                </ContentLoader>
            </Popup>
          </GroupWrapper>
      );
  }
}
