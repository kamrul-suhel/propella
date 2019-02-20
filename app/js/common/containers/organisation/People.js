import React from 'react';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { connect } from 'react-redux';
import * as selector from './selector';
import { PeopleWrapper } from 'app/containers/people';

@connect((state, ownProps) => {
	const getGroups = selector.makeGetGroups();
	const getGroup = selector.makeGetGroup();
	return {
		groups: getGroups(state),
		group: getGroup(state, ownProps.params.groupId)
	};
})
export default class View extends React.PureComponent {
	render() {
		return (
      <PeopleWrapper {...this.props} />
		);
	}
}
