import React from 'react';
import {connect} from 'react-redux';
import {makeGetPeopleTypes} from './selector';
import {fn, api} from 'app/utils';
import {Link} from 'react-router';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';
import {Nav} from 'app/components';
import {ContentLoader, Repeater, TextInput, Form} from '@xanda/react-components';

@connect((state, ownProps) => {
    const getPeopleTypes = makeGetPeopleTypes();
    return {
        peopleTypes: getPeopleTypes(state)
    };
})
export default class List extends React.PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            error: false,
            errorMessage: null
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'PEOPLE_TYPE',
            url: `/people-types`,
        }));
    }

    handleOnChange = (name, value) => this.setState({[name]: value})

    handleDeleteItem = (o) => {
        const {types} = this.state
        const updatedTypes = {
            ...types,
            [o.counter]: {
                id: o.id,
                title: o.title,
                deleted: true
            }
        }
        this.setState({types: updatedTypes})
    }

    handleSubmit = async () => {
        // Reset Form submit
        this.resetFormSubmit()

        const {types} = this.state
        const formData = new FormData()
        const user = fn.getUser()

        _.map(types, (type, i) => {
            formData.append(`types[${i}][user_group_id]`, user.id)
            formData.append(`types[${i}][title]`, type.title)
            formData.append(`types[${i}][id]`, type.id)
            if (type.deleted) {
                formData.append(`types[${i}][deleted]`, 1)
            }
        })

        const response = await api.put(`/people-types`, formData)

        if (!api.error(response)) {
            this.fetchData()
        } else {
            // Have error
            const errorMessage = response.data.message
            this.setState({
                error: true,
                errorMessage: errorMessage
            })
            this.fetchData()
        }
    }

    resetFormSubmit = () => {
        this.setState({
            error: false,
            errorMessage: null
        })
    }

    render() {
        const {
            peopleTypes
        } = this.props
        const {
            error,
            errorMessage
        } = this.state


        return (
            <React.Fragment>
                <Nav {...this.props} />
                <div className="centering project">
                    <div className="page-wrap no-padding">
                        <div className="grid">
                            <div className="grid-xs-12">
                                <h1>People Types</h1>
                                {
                                    error && <div className="errors">{errorMessage}</div>
                                }

                                <ContentLoader
                                    data={
                                        peopleTypes.collection}
                                    isLoading={peopleTypes.isLoading}
                                >
                                    <Form onSubmit={this.handleSubmit} className="no-scroll">
                                        <Repeater
                                            name="types"
                                            value={peopleTypes.collection}
                                            onChange={this.handleOnChange}
                                            onRemoved={this.handleDeleteItem}
                                        >
                                            <TextInput name="title"/>
                                        </Repeater>
                                        <button className="button">Update</button>
                                    </Form>
                                </ContentLoader>

                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
