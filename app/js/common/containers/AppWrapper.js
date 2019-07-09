import React from 'react';
import {connect} from 'react-redux';
import {fn} from 'app/utils';
import {url} from 'app/constants';
import {fetchData} from 'app/actions';

@connect((state) => {
    return {
        me: state.me
    };
})
export default class AppWrapper extends React.PureComponent {

    async componentWillMount() {
        await this.fetchData()

        if (!fn.isLoggedIn()) {
            window.location.href = `${url.wordpress}/${url.login}`
        }
    }

    componentDidMount() {
      const { id } = this.props.params;
      if (id) {
        document.documentElement.classList.add('scroll-lock');
      } else {
        document.documentElement.classList.remove('scroll-lock');
      }
    }

    fetchData = async () => {
        await this.props.dispatch(fetchData({
            type: 'ME',
            url: '/users/me/',
        }))
    }

    render() {
        if (!fn.isLoggedIn()) {
            return null
        }
        return React.Children.map(this.props.children, child => React.cloneElement(child, ...this.props));
    }
}
