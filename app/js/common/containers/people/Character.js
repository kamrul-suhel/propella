import React from 'react';
import { Link } from 'react-router';
import { Popup } from 'app/components';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { api, fn } from 'app/utils';
import { connect } from 'react-redux';
import * as selector from './selector';
import PeopleWrapper from './Wrapper';

@connect((state, ownProps) => {
	const getPeople = selector.makeGetPeople();
	const getPerson = selector.makeGetPerson();

	return {
		people: getPeople(state),
		person: getPerson(state, ownProps.params.personId),
    popup: state.popup
	};
})
export default class Edit extends React.PureComponent {
	constructor(props){
		super(props)

		this.state = {
			step: 1
		}
	}

  componentDidMount() {
    if('add' !== this.props.params.personId){
  		this.fetchData();
    }
	}

  componentDidUpdate(prevProps) {
    const { person, popup, route } = this.props
    if(popup.id != person.id){
      this.props.dispatch({type: 'POPUP_UPDATED', payload: person})
    }
	}

	fetchData = () => {
		this.props.dispatch(fetchData({
			type: 'PEOPLE',
			url: `/people/${this.props.params.personId}`,
		}));
	}

	render() {
    const { person, popup, params } = this.props
        const { step } = this.state;

		return (
      <PeopleWrapper {...this.props}>
  			<Popup
          additionalClass={(step !== 4 ? `people wide` : 'people small-window')}
  				title={popup.title ? `Person: ${popup.title}` : `New Person`}
  				closePath={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`}
  			>
          <p className="form-label form-label-title">Choose a character</p>
  			</Popup>
      </PeopleWrapper>
		);
	}
}
