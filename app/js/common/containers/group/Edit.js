import React from 'react';
import {Link} from 'react-router';
import {Popup} from 'app/components';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {api, fn} from 'app/utils';
import {connect} from 'react-redux';
import {makeGetProjectUsers} from 'app/containers/project/selector';
import * as selector from './selector';
import Description from './edit/Description';
import Royalty from './edit/Royalty';
import Loyalty from './edit/Loyalty';
import Overview from './edit/Overview';
import {ProjectWrapper} from 'app/containers/project';

@connect((state, ownProps) => {
    const getGroups = selector.makeGetProjectGroups();
    const getGroup = selector.makeGetProjectGroup();
    const getProjectUsers = makeGetProjectUsers();

    return {
        groups: getGroups(state, ownProps.params.id),
        group: getGroup(state, ownProps.params.id, ownProps.params.groupId),
        popup: state.popup,
        projectUsers: getProjectUsers(state),
        project:state.project
    };
})
export default class Edit extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            step: 1
        }
    }

    componentDidMount(prevProps) {
        if ('add' !== this.props.route.type) {
            this.fetchData()
        }
        this.fetchProjectUsers()
    }

    componentDidUpdate(prevProps) {
        const {group, popup} = this.props
        if (popup.id != (group || {}).id) {
            this.props.dispatch({type: 'POPUP_UPDATED', payload: group})
        }
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT',
            url: `/projects/${this.props.params.id}`,
            projectId: this.props.params.id
        }));
    }

    fetchProjectUsers = () => {
        this.props.dispatch(fetchData({
            type: 'PROJECT_USER',
            url: `/users`,
        }));
    }

    handleInputChange = (name, value) => {
        this.setState({
            [name]: value
        });
        this.props.dispatch({type: 'POPUP_UPDATED', payload: {[name]: value}})
    }

    handleStepChange = (newStep) => this.setState({step: newStep})

    setFormRef = (ref) => this.formRef = ref

    triggerSubmit = () => this.formRef.submit()

    handleSubmit = async () => {
        const {popup, params, group, location, dispatch} = this.props
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
        formData.append('rel_user_id', popup.rel_user_id)
        formData.append('project_id', params.id)

        // update if it already exists else create a new one
        let response
        if ((group || {}).id) {
            formData.append('id', group.id)
            response = await api.put(`/groups/${group.id}`, formData)
        } else {
            response = await api.post('/groups', formData)
        }

        if (!api.error(response)) {
            const projectId = this.props.params.id
            const group = {...response.data}
            dispatch({
                type: 'GROUP_UPDATE',
                payload: {
                    project_id: projectId,
                    save:true,
                    group
                }
            })
            const redirectUrl = location.query.zoom ? `/${url.projects}/${params.id}/${url.groups}/${url.zoom}?zoom=${location.query.zoom}` : `/${url.projects}/${params.id}/${url.groups}`
            fn.navigate(redirectUrl)
        }
    }

    popupActions = () => {
        const {step} = this.state
        const {group, location} = this.props
        const projectUrl = location.query.zoom ? `/${url.projects}/${this.props.params.id}/zoom?zoom=${location.query.zoom}` :
            `/${url.projects}/${this.props.params.id}/${url.groups}`

        switch (step) {
            case 1:
                return (
                    [
                        <Link key={'cancel'}
                              to={projectUrl}
                              className="button">Cancel
                        </Link>,
                        <button key={'next'}
                                onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 2:
                return (
                    [
                        <button key={'cancel'}
                                type="button"
                                onClick={() => this.handleStepChange(1)}
                                className="button">Back
                        </button>,
                        <button key={'next'}
                                onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 3:
                return (
                    [
                        <button key={'cancel'}
                                type="button"
                                onClick={() => this.handleStepChange(2)}
                                className="button">Back
                        </button>,
                        <button key={'next'}
                                onClick={this.triggerSubmit}
                                type="button"
                                className="button">Next
                        </button>
                    ]
                );
            case 4:
                return (
                    [
                        <button key={'cancel'}
                                type="button" onClick={() => this.handleStepChange(1)}
                                className="button">Edit
                        </button>,
                        <button key={'next'}
                                onClick={this.handleSubmit}
                                type="button"
                                className="button">
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
            setFormRef: this.setFormRef,
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
        const {popup, params, location} = this.props
        const {step} = this.state;
        const closePath = location.query.zoom ? `/${url.projects}/${params.id}/zoom?zoom=${location.query.zoom}` : `/${url.projects}/${params.id}`

        return (
            <ProjectWrapper {...this.props}>
                <Popup
                    additionalClass={(step !== 4 ? `groups wide` : 'groups small-window')}
                    title={popup.title ? `Group: ${popup.title}` : `New Group`}
                    closePath={closePath}
                    buttons={this.popupActions()}
                >
                    <div>
                        {this.editStep()}
                    </div>
                </Popup>
            </ProjectWrapper>
        );
    }
}
