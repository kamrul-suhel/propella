import React from 'react';
import { connect } from 'react-redux';

@connect((state) => {
	return {
		alerts: state.alert.alerts,
	}
})
export default class Alerts extends React.PureComponent {

	render() {

		const { alerts } = this.props

		return (
      <React.Fragment>
        {alerts &&
          <ul className="errors">{_.map(alerts, (e,i) => <li className="errors-error" key={i}>{e}</li>)}</ul>
        }
      </React.Fragment>
		);
	}
}
