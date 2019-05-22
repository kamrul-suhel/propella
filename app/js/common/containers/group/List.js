import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader} from '@xanda/react-components';
import {Popup, FancyList, FancyListItem} from 'app/components';
import {api} from 'app/utils';
import {url} from 'app/constants';
import { makeGetProject, makeGetProjects } from 'app/containers/project/selector';
import { ProjectWrapper } from 'app/containers/project';

@connect((state, ownProps) => {
    const getProjects = makeGetProjects();
    const getProject = makeGetProject();
    return {
        projects: getProjects(state),
        project: getProject(state, ownProps.params.id),
    };
})
export default class List extends React.PureComponent {
    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
        }));
    }

    handleStatusChange = async (group, newStatus) => {
        // check status has changed
        const status = newStatus === "1" ? 1 : 0
        if (group.status !== status) {
            const response = await api.put(`groups/${group.id}`, {status: status})
            if (!api.error(response)) {
                this.fetchData()
            }
        }
    }

    handleDelete = async (groupId) => {
        if (window.confirm("Are you sure you want to delete this group?")) {
            const response = await api.delete(`groups/${groupId}`)
            if (!api.error(response)) {
                this.props.dispatch({type: 'GROUP_DELETED', payload: response.data})
            }
        }
    }

    renderItem = (group) => {
        const { location } = this.props
        if (!group) {
            return
        }
        let editGroupUrl = `/${url.projects}/${this.props.params.id}/${url.groups}/${group.id}/edit`
        editGroupUrl = location.query.zoom ? `${editGroupUrl}?zoom=${location.query.zoom}` : editGroupUrl

        return (
            <FancyListItem
                key={group.id}
                keyId={group.id}
                className={(group.status === 1) ? `is-active` : `is-inactive`}
                icon={group.icon_path}
                actions={
                    <React.Fragment>
                        <Checkbox
                            name="status"
                            value={group.status}
                            options={[
                                {
                                    id: 1,
                                    title: 'Visible'
                                }
                            ]}
                            onChange={(name, value) => this.handleStatusChange(group, value)}
                            styled
                            className="switch"
                        />
                        <Link
                          to={editGroupUrl}
                          className="icon-pencil"
                        />
                        <span onClick={() => this.handleDelete(group.id)} className="clickable icon-bin"/>
                        <Link
                          to={`/${url.projects}/${this.props.params.id}/${url.groups}/${group.id}`}
                          className="icon-add-organisation"
                        />
                    </React.Fragment>
                }
            >
                {group.title}
            </FancyListItem>

        )
    }

    render() {
        const {projects, project, location} = this.props
        const closePath = location.query.zoom ? `/${url.projects}/${this.props.params.id}/${url.zoom}?zoom=${location.query.zoom}` : `/${url.projects}/${this.props.params.id}`
        const addGroupLink = location.query.zoom ? `/${url.projects}/${this.props.params.id}/${url.groups}/add?zoom=${location.query.zoom}` : `/${url.projects}/${this.props.params.id}/${url.groups}/add`

        return (
            <ProjectWrapper {...this.props}>
              <Popup
                  additionalClass="groups"
                  title="Groups"
                  closePath={closePath}
                  buttons={_.isEmpty(project.groups) ? `` :
                      <Link className="button"
                            to={addGroupLink}>Add group
                      </Link>}
              >
                  <ContentLoader
                      data={projects.collection}
                      isLoading={projects.isLoading}
                  >
                      {_.isEmpty(project.groups) ? (
                          <Link className="button" to={`/${url.projects}/${this.props.params.id}/${url.groups}/add`}>Add your first
                              group <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
                      ) : (
                          <React.Fragment>
                              <FancyList>
                                  {_.map(project.groups, (group) => this.renderItem(group))}
                              </FancyList>
                          </React.Fragment>
                      )}
                  </ContentLoader>
              </Popup>
              {_.isEmpty(project.groups) &&
              <span className="large-plus-sign"></span>
                }
            </ProjectWrapper>
        );
    }
}
