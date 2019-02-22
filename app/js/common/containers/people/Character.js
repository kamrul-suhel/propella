import React from 'react';
import { Link } from 'react-router';
import { Popup } from 'app/components';
import { url } from 'app/constants';
import { fetchData } from 'app/actions';
import { api, fn } from 'app/utils';
import { connect } from 'react-redux';
import * as selector from './selector';
import PeopleWrapper from './Wrapper';
import Slider from "react-slick";

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
      activeSlide: 0
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
    const { params } = this.props
		this.props.dispatch(fetchData({
			type: 'PEOPLE',
			url: `/people/${params.personId}`,
		}));
	}

  fetchGroup = () => {
    const { params } = this.props
    this.props.dispatch(fetchData({
        type: 'GROUP',
        url: `/groups/${params.groupId}`,
    }));
  }

  handleSubmit = async () => {
    const { params } = this.props
    const { activeSlide } = this.state
    const response = await api.put(`/people/${params.personId}`, {character_id: activeSlide})
    if(!api.error(response)){
      this.fetchGroup()
      fn.navigate(`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`)
    }
  }

	render() {
    const { person, popup, params } = this.props
    const { step } = this.state;

    const sliderSettings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      beforeChange: (current, next) => this.setState({ activeSlide: next }),
    }

		return (
      <PeopleWrapper {...this.props}>
  			<Popup
          additionalClass={(step !== 4 ? `people wide` : 'people small-window')}
  				title={popup.title ? `Person: ${popup.title}` : `New Person`}
  				closePath={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}`}
          buttons={
            <React.Fragment>
              <Link to={`/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.people}`} className="button">Cancel</Link>
              <span className="clickable" onClick={this.handleSubmit} className="button">Choose</span>
            </React.Fragment>
          }
  			>
          <p className="form-label form-label-title">Choose a character</p>
          <Slider {...sliderSettings}>
            <div>
              <h3>The Ambassador</h3>
            </div>
            <div>
              <h3>The Mirage</h3>
            </div>
            <div>
              <h3>The Boomerang</h3>
            </div>
            <div>
              <h3>The Trojan Horse</h3>
            </div>
          </Slider>

  			</Popup>
      </PeopleWrapper>
		);
	}
}
