import React from 'react';
import { connect } from 'react-redux';
import { makeGetOrganisationTypes } from './selector';
import { fn, api } from 'app/utils';
import { Link } from 'react-router';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { Nav } from 'app/components';
import { ContentLoader, Repeater, TextInput, Form } from '@xanda/react-components';

@connect((state, ownProps) => {
const getOrganisationTypes = makeGetOrganisationTypes();
        return {
        organisationTypes: getOrganisationTypes(state)
        };
        })
export default class List extends React.PureComponent {
    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        this.props.dispatch(fetchData({
            type: 'ORGANISATION_TYPE',
            url: `/organisation-types`,
        }));
    }

    handleOnChange = (name, value) => this.setState({[name]: value}
        )

    handleSubmit = async () => {
        const {types} = this.state
        const formData = new FormData()
        const user = fn.getUser()

        _.map(types, (type, i) => {
            formData.append(`types[${i}][user_group_id]`, user.id)
            formData.append(`types[${i}][title]`, type.title)
            formData.append(`types[${i}][id]`, type.id)
        })

        const response = await api.put(`/organisation-types`, formData)
    }

    render() {
        const {organisationTypes} = this.props

        return (
                <React.Fragment>
                    <Nav {...this.props} />
                    <ContentLoader
                        data={organisationTypes.collection}
                        isLoading={organisationTypes.isLoading}
                        >
                        <div className="centering project">
                            <div className="page-wrap no-padding">
                                <div className="grid">
                                    <div className="grid-xs-12">
                                        <h1>Organisation Types</h1>
                                        <Form onSubmit={this.handleSubmit} className="no-scroll">
                                            <Repeater
                                                name="types"
                                                value={organisationTypes.collection}
                                                onChange={this.handleOnChange}
                                                >
                                                <TextInput name="title" />
                                            </Repeater>
                                            <button className="button">Update</button>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ContentLoader>
                </React.Fragment>
                )
    }
}
