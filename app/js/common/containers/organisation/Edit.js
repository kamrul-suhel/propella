import React from 'react';
import {Link} from 'react-router';
import Draggable from 'react-draggable';
import {Popup} from 'app/components';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {api, fn} from 'app/utils';
import {connect} from 'react-redux';
import {Form, TextInput, Radio, FileUpload} from '@xanda/react-components';
import * as selector from './selector';
import { makeGetProjectUsers } from 'app/containers/project/selector'
import Description from './edit/Description';
import Royalty from './edit/Royalty';
import Loyalty from './edit/Loyalty';
import Overview from './edit/Overview';
import { GroupWrapper } from 'app/containers/group';

@connect((state, ownProps) => {
    const getOrganisations = selector.makeGetOrganisations();
    const getOrganisation = selector.makeGetOrganisation();
    const getOrganisationTypes = selector.makeGetOrganisationTypes();
    const getProjectUsers = makeGetProjectUsers();
    return {
        organisations: getOrganisations(state),
        organisation: getOrganisation(state, ownProps.params.organisationId),
        organisationTypes: getOrganisationTypes(state),
        projectUsers: getProjectUsers(state),
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
        if ('add' !== this.props.params.organisationId) {
            this.fetchData();
        }
        this.fetchOrganisationTypes();
        this.fetchProjectUsers();
    }

    componentDidUpdate(prevProps) {
        const {organisation, popup, route} = this.props
        if (popup.id != organisation.id) {
            this.props.dispatch({type: 'POPUP_UPDATED', payload: organisation})
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'ORGANISATION',
            url: `/organisations/${this.props.params.organisationId}`,
        }));
    }

    fetchGroup = () => {
        this.props.dispatch(fetchData({
            type: 'GROUP',
            url: `/groups/${this.props.params.groupId}`,
        }));
    }

    fetchOrganisationTypes = () => {
        this.props.dispatch(fetchData({
            type: 'ORGANISATION_TYPE',
            url: `/organisation-types`,
        }));
    }

    fetchProjectUsers = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT_USER',
            url: `/users`,
        }));
    }

    handleInputChange = (name, value) => this.props.dispatch({type: 'POPUP_UPDATED', payload: {[name]: value}})

    handleStepChange = (newStep) => this.setState({step: newStep})

    setFormRef = (ref) => this.formRef = ref

    triggerSubmit = () => this.formRef.submit()

    handleSubmit = async () => {
        const {popup, params, organisation} = this.props
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
        formData.append('rel_user_id', popup.rel_user_id)
        formData.append('group_id', params.groupId)

        let response
        if (organisation.id) {
            formData.append('id', organisation.id)
            response = await api.put(`/organisations/${organisation.id}`, formData)
        } else {
            response = await api.post('/organisations', formData)
        }

        if (!api.error(response)) {
            this.fetchGroup()
            this.fetchData()
            fn.navigate(`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}`)
        }
    }

    popupActions = () => {
        const {step} = this.state
        const {organisation, params} = this.props

        switch (step) {
            case 1:
                return (
                    [
                        <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}`}
                              className="button">Cancel</Link>,
                        <button onClick={this.triggerSubmit} type="button" className="button">Next</button>
                    ]
                );
            case 2:
                return (
                    [
                        <button type="button" onClick={() => this.handleStepChange(1)} className="button">Back</button>,
                        <button onClick={this.triggerSubmit} type="button" className="button">Next</button>
                    ]
                );
            case 3:
                return (
                    [
                        <button type="button" onClick={() => this.handleStepChange(2)} className="button">Back</button>,
                        <button onClick={this.triggerSubmit} type="button" className="button">Next</button>
                    ]
                );
            case 4:
                return (
                    [
                        <button type="button" onClick={() => this.handleStepChange(1)} className="button">Edit</button>,
                        <button onClick={this.handleSubmit} type="button" className="button">
                            {organisation.id ? 'Update' : 'Add to board'}
                        </button>
                    ]
                );
        }
    }

    editStep = () => {
        const passProps = {
            ...this.props.popup,
            handleInputChange: this.handleInputChange,
            handleSubmit: this.handleSubmit,
            setFormRef: this.setFormRef,
            organisationTypes: this.props.organisationTypes,
            projectUsers: this.props.projectUsers
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
        console.log("Porps is : ", this.props);
        const {organisation, popup, params} = this.props
        const {step} = this.state

        return (
            <GroupWrapper {...this.props}>
              <Popup
                  additionalClass={(step !== 4 ? `organisations wide` : 'organisations small-window')}
                  title={popup.title ? `Organisation: ${popup.title}` : `New Organisation`}
                  closePath={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`}
                  buttons={this.popupActions()}
              >
                  {this.editStep()}
              </Popup>
            </GroupWrapper>
        );
    }
}
