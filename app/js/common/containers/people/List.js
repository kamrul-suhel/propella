import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader} from '@xanda/react-components';
import {Popup} from 'app/components';
import {api} from 'app/utils';
import {url} from 'app/constants';
import {makeGetGroup, makeGetGroups} from 'app/containers/group/selector';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
    };
})
export default class List extends React.PureComponent {
    handleDelete = async (groupId, personId) => {
        if (window.confirm("Are you sure you want to delete this person?")) {
            const response = await api.delete(`people/${personId}`)
            if (!api.error(response)) {
                this.props.dispatch({type: 'GROUP_PEOPLE_DELETED', payload: {groupId, personId}})
            }
        }
    }

    renderItem = (person) => {
        if (!person) {
            return
        }

        return (
            <li key={person.id}>
                <p>{person.title}</p>
                {person.organisation_title &&
                <p>{person.organisation_title}</p>
                }
                <Link
                    to={`/${url.projects}/${this.props.params.id}/${url.groups}/${this.props.params.groupId}/${url.people}/${person.id}`}>Edit</Link>
                <button type="button" onClick={() => this.handleDelete(this.props.params.groupId, person.id)}>Delete
                </button>
            </li>
        )
    }

    render() {
        const {groups, group, params} = this.props

        return (
            <Popup
                beforeTitle={<Link
                    to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}`}>Organisations</Link>}
                title="People"
                closePath={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`}
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
            >
                <ContentLoader
                    data={groups.collection}
                    isLoading={groups.isLoading}
                >
                    {_.isEmpty(group.people) ? (
                        <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add`}>Add
                            your first person <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
                    ) : (
                        <React.Fragment>
                            <ul>
                                {_.map(group.people, (person) => {
                                    return this.renderItem(person)
                                })}
                            </ul>
                        </React.Fragment>
                    )}
                </ContentLoader>
            </Popup>
        );
    }
}
