import React from 'react';
import {Link} from 'react-router';
import {Popup} from 'app/components';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {api, fn} from 'app/utils';
import {connect} from 'react-redux';
import * as selector from './selector';
import {makeGetGroups, makeGetGroup} from 'app/containers/group/selector';
import Description from './edit/Description';
import Royalty from './edit/Royalty';
import Loyalty from './edit/Loyalty';
import Overview from './edit/Overview';
import PeopleWrapper from './Wrapper';

@connect((state, ownProps) => {
    const getPeople = selector.makeGetPeople();
    const getPerson = selector.makeGetPerson();
    const getPeopleTypes = selector.makeGetPeopleTypes();
    const getGroups = makeGetGroups();
    const getGroup = makeGetGroup();

    return {
        groups: getGroups(state),
        group: getGroup(state, ownProps.params.groupId),
        people: getPeople(state),
        person: getPerson(state, ownProps.params.personId),
        peopleTypes: getPeopleTypes(state),
        popup: state.popup
    };
})
export default class Edit extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            step: 1
        }
    }

    componentDidMount() {
        if ('add' !== this.props.params.personId) {
            this.fetchData();
        }
        this.fetchPeopleTypes();
    }

    componentDidUpdate(prevProps) {
        const {
            person,
            popup,
            route,
            group,
            params,
            groups
        } = this.props
        const updatedPeople = groups.updatedPeople
        const personId = +params.personId

        if (popup.id != person.id) {
            if (_.includes(updatedPeople, personId)) {
                _.map(group.people, (people) => {
                    if (people.id === personId) {
                        let newPerson = {...person}
                        newPerson.positionX = people.positionX
                        newPerson.positionY = people.positionY
                        this.props.dispatch({type: 'POPUP_UPDATED', payload: newPerson})
                    }
                })
            } else {
                this.props.dispatch({type: 'POPUP_UPDATED', payload: person})
            }
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PEOPLE',
            url: `/people/${this.props.params.personId}`,
        }));
    }

    fetchGroup = () => {
        this.props.dispatch(fetchData({
            type: 'GROUP',
            url: `/groups/${this.props.params.groupId}`,
            groupId: this.props.params.groupId
        }));
    }

    fetchPeopleTypes = () => {
        this.props.dispatch(fetchData({
            type: 'PEOPLE_TYPE',
            url: `/people-types`,
        }));
    }

    handleInputChange = (name, value) => this.props.dispatch({type: 'POPUP_UPDATED', payload: {[name]: value}})

    handleStepChange = (newStep) => this.setState({step: newStep})

    setFormRef = (ref) => this.formRef = ref

    triggerSubmit = () => this.formRef.submit()

    handleSubmit = async () => {
        const {
            popup,
            params,
            person,
            location,
            dispatch
        } = this.props
        const {step} = this.state

        // submit an api call if your on the last step otherwise go to the next step
        if (step < 4) {
            const newStep = step + 1
            return this.handleStepChange(newStep)
        }

        const formData = new FormData()
        formData.append('title', popup.title)
        formData.append('abbreviation', popup.abbreviation)
        formData.append('description', popup.description)
        popup.icon && formData.append('icon_path', popup.icon)
        formData.append('icon_size', popup.icon_size)
        formData.append('positionX', popup.positionX)
        formData.append('positionY', popup.positionY)
        formData.append('type_id', popup.type_id)
        formData.append('organisation_id', popup.organisation_id)

        let response
        if (person.id) {
            formData.append('id', person.id)
            response = await api.put(`/people/${person.id}`, formData)
        } else {
            response = await api.post('/people', formData)
        }

        if (!api.error(response)) {
            dispatch({
                type: 'DRAGGED_PEOPLE_RESET'
            })

            dispatch({
                type: 'UPDATE_DRAGGED_PEOPLE',
                payload: {
                    groupId: params.groupId,
                    people: {...response.data},
                    save: true
                }
            })

            this.fetchGroup()
            let redirectUrl = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`
            redirectUrl = location.query.zoom ? `${redirectUrl}/${url.zoom}?zoom=${location.query.zoom}` : redirectUrl
            fn.navigate(redirectUrl)
        }
    }

    popupActions = () => {
        const {
            step
        } = this.state
        const {
            person,
            params,
            location
        } = this.props
        let closeLink = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.people}`
        closeLink = location.query.zoom ? `${closeLink}/zoom?zoom=${location.query.zoom}` : closeLink

        switch (step) {
            case 1:
                return (
                    [
                        <Link className="button"
                              to={closeLink}>Cancel
                        </Link>,
                        <button onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 2:
                return (
                    [
                        <button type="button"
                                onClick={() => this.handleStepChange(1)}
                                className="button">Back
                        </button>,
                        <button onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 3:
                return (
                    [
                        <button type="button"
                                onClick={() => this.handleStepChange(2)}
                                className="button">Back
                        </button>,
                        <button onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 4:
                return (
                    [
                        <button type="button"
                                onClick={() => this.handleStepChange(1)}
                                className="button">Edit
                        </button>,
                        <button onClick={this.handleSubmit}
                                type="button"
                                className="button">
                            {person.id ? 'Update' : 'Add to board'}
                        </button>
                    ]
                );
        }
    }

    editStep = () => {
        const passProps = {
            ...this.props.popup,
            location: this.props.location,
            handleInputChange: this.handleInputChange,
            handleSubmit: this.handleSubmit,
            setFormRef: this.setFormRef,
            peopleTypes: this.props.peopleTypes,
            organisations: this.props.group.organisations
        }

        switch (this.state.step) {
            case 1:
                return <Description {...passProps} />;
            case 2:
                return <Royalty {...passProps} />;
            case 3:
                return <Loyalty {...passProps} />;
            case 4:
                return <Overview {...passProps} />;
        }
    }

    render() {
        const {
            popup,
            params,
            location
        } = this.props
        const {
            step
        } = this.state
        let closePeopleLink = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.people}`
        closePeopleLink = location.query.zoom ? `${closePeopleLink}/${url.zoom}?zoom=${location.query.zoom}` : closePeopleLink

        return (
            <PeopleWrapper {...this.props}>
                <Popup
                    additionalClass={(step !== 4 ? `people wide` : 'people small-window')}
                    title={popup.title ? `Person: ${popup.title}` : `New Person`}
                    closePath={closePeopleLink}
                    buttons={this.popupActions()}
                >
                    {this.editStep()}
                </Popup>
            </PeopleWrapper>
        );
    }
}