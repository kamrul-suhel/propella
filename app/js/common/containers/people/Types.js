import React from 'react';
import { connect } from 'react-redux';
import { makeGetPeopleTypes } from './selector';
import { fn, api } from 'app/utils';
import { Link } from 'react-router';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { Nav } from 'app/components';
import { ContentLoader, Repeater, TextInput, Form } from '@xanda/react-components';

@connect((state, ownProps) => {
	const getPeopleTypes = makeGetPeopleTypes();
	return {
		peopleTypes: getPeopleTypes(state)
	};
})
export default class List extends React.PureComponent {
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
    const { types } = this.state
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
    const { types } = this.state
    const formData = new FormData()
    const user = fn.getUser()

    _.map(types, (type, i) => {
      formData.append(`types[${i}][user_group_id]`, user.id)
      formData.append(`types[${i}][title]`, type.title)
      formData.append(`types[${i}][id]`, type.id)
      if(type.deleted){
        formData.append(`types[${i}][deleted]`, 1)
      }
    })

    const response = await api.put(`/people-types`, formData)
  }

	render() {
    const { peopleTypes } = this.props

		return (
      <React.Fragment>
          <Nav {...this.props} />
          <ContentLoader
            data={peopleTypes.collection}
            isLoading={peopleTypes.isLoading}
          >
            <Form onSubmit={this.handleSubmit}>
              <Repeater
                name="types"
                value={peopleTypes.collection}
                onChange={this.handleOnChange}
                onRemoved={this.handleDeleteItem}
              >
                <TextInput name="title" />
              </Repeater>
              <button className="button">Update</button>
            </Form>
          </ContentLoader>
      </React.Fragment>
	   )
   }
}
