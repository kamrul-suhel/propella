import React from 'react';
import { connect } from 'react-redux';
import { fn } from 'app/utils';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';

@connect((state) => {
	return {
		me: state.me
	};
})
export default class AppWrapper extends React.PureComponent {

  componentDidMount() {
      this.fetchData()
	}

  fetchData = async () => {
    await this.props.dispatch(fetchData({
      type: 'ME',
      url: '/users/me/',
    }))
  }

	render() {
		return React.Children.map(this.props.children, child => React.cloneElement(child, ...this.props));
	}
}
