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
import Description from './edit/Description';
import Royalty from './edit/Royalty';
import Loyalty from './edit/Loyalty';
import Overview from './edit/Overview';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetProjectGroups();
    const getGroup = selector.makeGetProjectGroup();
    return {
        groups: getGroups(state, ownProps.params.id),
        group: getGroup(state, ownProps.params.id, ownProps.params.groupId),
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

    componentDidUpdate(prevProps) {
        const {group, popup} = this.props
        if ('add' !== this.props.route.type && popup.id != group.id) {
            this.props.dispatch({type: 'POPUP_UPDATED', payload: group})
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
        }));
    }

    handleInputChange = (name, value) => {
        this.setState({
            [name] : value
        });
        this.props.dispatch({type: 'POPUP_UPDATED', payload: {[name]: value}})
    }

    handleStepChange = (newStep) => this.setState({step: newStep})

    setFormRef = (ref) => this.formRef = ref

    triggerSubmit = () => this.formRef.submit()

    handleSubmit = async () => {
        const {popup, params, group} = this.props
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
        formData.append('icon_size', popup.icon_size)
        popup.icon && formData.append('icon_path', popup.icon)
        formData.append('positionX', popup.positionX)
        formData.append('positionY', popup.positionY)
        formData.append('project_id', params.id)

        // update if it already exists else create a new one
        let response
        if (group.id) {
            formData.append('id', group.id)
            response = await api.put(`/groups/${group.id}`, formData)
        } else {
            response = await api.post('/groups', formData)
        }

        if (!api.error(response)) {
            this.fetchData();
            fn.navigate(`/${url.projects}/${params.id}`)
        }
    }

    popupActions = () => {
        const {step} = this.state
        const {group} = this.props

        switch (step) {
            case 1:
                return (
                    [
                        <Link to={`/${url.projects}/${this.props.params.id}/${url.groups}`}
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
                            {group && group.id ? 'Update' : 'Add to board'}
                        </button>
                    ]
                );
        }
    }

    editStep = () => {
        const passProps = {
            ...this.props.popup,
            handleInputChange: this.handleInputChange,
            handleFileInputChange: this.handleFileInputChange,
            handleSubmit: this.handleSubmit,
            setFormRef: this.setFormRef
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
        const {group, popup, params} = this.props
        const {step} = this.state;
        return (
            <Popup
                additionalClass={`groups step-${step}`}
                title={popup.title ? `Group: ${popup.title}` : `New Group`}
                closePath={`/${url.projects}/${params.id}`}
                buttons={this.popupActions()}
            >
                <div>
                    {this.editStep()}
                </div>
            </Popup>
        );
    }
}
