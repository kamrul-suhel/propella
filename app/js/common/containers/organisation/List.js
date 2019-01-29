import React from 'react';
import { Link } from 'react-router';
import { fetchData } from 'app/actions';
import { connect } from 'react-redux';
import { Form, Checkbox, ContentLoader } from '@xanda/react-components';
import { FancyList, FancyListItem, Popup } from 'app/components';
import { api } from 'app/utils';
import { url } from 'app/constants';
import { makeGetGroup, makeGetGroups } from 'app/containers/group/selector';

@connect((state, ownProps) => {
	const getGroups = makeGetGroups();
	const getGroup = makeGetGroup();
	return {
		groups: getGroups(state),
		group: getGroup(state, ownProps.params.groupId),
	};
})
export default class List extends React.PureComponent {
  handleStatusChange = async (organisation, newStatus) => {
    // check status has changed
    const status = newStatus === "1" ? 1 : 0
    if(organisation.status !== status){
      const response = await api.put(`organisations/${organisation.id}`, { status:status })
      if(!api.error(response)){
        this.props.dispatch({type: 'ORGANISATION_UPDATED', payload: response.data})
      }
    }
  }

  handleDelete = async (groupId, organisationId) => {
    if (window.confirm("Are you sure you want to delete this organisation?")) {
      const response = await api.delete(`organisations/${organisationId}`)
      if(!api.error(response)){
        this.props.dispatch({type: 'GROUP_ORGANISATION_DELETED', payload: {groupId, organisationId}})
      }
    }
  }

  renderItem = (organisation) => {
    if(!organisation){
      return
    }

    const { params } = this.props

    return (
      <FancyListItem
        key={organisation.id}
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
            <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${organisation.id}`}>Edit</Link>
            <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add?organisation_id=${organisation.id}`}>Add Person</Link>
            <button type="button" onClick={() => this.handleDelete(params.groupId, organisation.id)}>Delete</button>
          </React.Fragment>
        }
      >
        {organisation.title}
      </FancyListItem>
    )
  }

	render() {
		const { groups, group, params } = this.props

		return (
			<Popup
				title="Organisations"
        afterTitle={<Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`}>People</Link>}
				closePath={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`}
        buttons={
          <React.Fragment>
            {!_.isEmpty(group.organisations) &&
              <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/add`} className="button">Add organisation</Link>
            }
          </React.Fragment>
        }
			>
      <ContentLoader
        data={groups.collection}
        isLoading={groups.isLoading}
      >
				{_.isEmpty(group.organisations) ? (
					<Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/add`}>Add your first organisation <span dangerouslySetInnerHTML={{__html: `&plus;`}} /></Link>
        ) : (
          <FancyList>
							{_.map(group.organisations, (organisation) => this.renderItem(organisation))}
					</FancyList>
				)}
        </ContentLoader>
			</Popup>
		);
	}
}
