import React from 'react';
import {Link} from 'react-router';
import {fetchData} from 'app/actions';
import {connect} from 'react-redux';
import {Form, Checkbox, ContentLoader} from '@xanda/react-components';
import {Popup, FancyList, FancyListItem} from 'app/components';
import {api, fn} from 'app/utils';
import {url} from 'app/constants';
import {makeGetGroup, makeGetGroups} from 'app/containers/group/selector';
import {makeGetPeople} from './selector';
import PeopleWrapper from './Wrapper';

@connect((state, ownProps) => {
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();
    const getPeople = makeGetPeople();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        people: getPeople(state)
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

    handleToggleCharacters = () => {
        this.props.dispatch({type: 'TOGGLE_DISPLAY_CHARACTERS'})
    }

    renderItem = (person) => {
        const {params} = this.props

        if (!person) {
            return
        }

        const character = fn.getPeopleCharacter(person.character_id)

        return (
            <FancyListItem
                key={person.id}
                actions={
                    <React.Fragment>
                        <Link
                            to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/${person.id}`}
                            className="icon-pencil"
                        />
                        <span type="button" onClick={() => this.handleDelete(params.groupId, person.id)}
                              className="clickable icon-bin"/>
                        {person.character_id !== 0 ? (
                            <Link
                                to={`/${url.projects}/${params.id}/groups/${params.groupId}/${url.people}/${person.id}/${url.characters}?character=${character.id}`}
                                className={character['iconImage']}
                                title={character['title']}
                            />
                        ) : (
                            <Link
                                to={`/${url.projects}/${params.id}/groups/${params.groupId}/${url.people}/${person.id}/${url.characters}`}
                                className="icon-masks gray"
                                title={character['title']}
                            />
                        )}
                    </React.Fragment>
                }
                category={person.organisation_title}
            >
                {person.title}
            </FancyListItem>
        )
    }

    render() {
        const {groups, group, params, people} = this.props
        let organisationUrl = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}`

        let addPeopleLink = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add`

        return (
            <PeopleWrapper {...this.props}>
                <Popup
                    beforeTitle={<Link
                        to={organisationUrl}>Organisations</Link>}
                    title="People"
                    buttons={
                        <React.Fragment>
                            {!_.isEmpty(group.people) &&
                            <React.Fragment>
                                <Link
                                    className="button"
                                    to={addPeopleLink}
                                >Add Person</Link>
                                <span
                                    className="button"
                                    onClick={this.handleToggleCharacters}
                                >{people.showCharacters ? 'Hide' : 'View'} Characters</span>
                            </React.Fragment>
                            }
                        </React.Fragment>
                    }
                    additionalClass="people wide"
                    hide
                >
                    <ContentLoader
                        data={groups.collection}
                        isLoading={groups.isLoading}
                    >
                        {_.isEmpty(group.people) ? (
                            <Link className="button"
                                  to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}/add`}>Add
                                your first person <span dangerouslySetInnerHTML={{__html: `&plus;`}}/></Link>
                        ) : (
                            <React.Fragment>
                                <FancyList>
                                    <li className="fancylist-item undefined">
                                        <span className="fancylist-item-title">Name</span>
                                        <span className="fancylist-item-category">ORG</span>
                                        <span className="fancylist-item-actions"></span>
                                    </li>
                                    {_.map(group.people, (person) => {
                                        return this.renderItem(person)
                                    })}
                                </FancyList>
                            </React.Fragment>
                        )}
                    </ContentLoader>
                </Popup>

                {_.isEmpty(group.people) &&
                <span className="large-plus-sign"></span>
                }
            </PeopleWrapper>
        );
    }
}
