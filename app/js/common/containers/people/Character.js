import React from "react";
import {Link} from "react-router";
import {Popup} from "app/components";
import {url} from "app/constants";
import {fetchData} from "app/actions";
import {api, fn} from "app/utils";
import {connect} from "react-redux";
import * as selector from "./selector";
import PeopleWrapper from "./Wrapper";
import {CharacterPosition} from "app/components"
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
    constructor(props) {
        super(props);

        const {location} = props;

        this.state = {
            activeSlide: location.query.character ? location.query.character - 1 : 0,
            characterPos: false,
            selectedCharacter: {}
        };
    }

    componentDidMount() {
        if ("add" !== this.props.params.personId) {
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps) {
        const {person, popup, route} = this.props;
        if (popup.id != person.id) {
            this.props.dispatch({type: "POPUP_UPDATED", payload: person});
        }
    }

    fetchData = () => {
        const {params} = this.props;
        this.props.dispatch(
            fetchData({
                type: "PEOPLE",
                url: `/people/${params.personId}`
            })
        );
    };

    fetchGroup = () => {
        const {params} = this.props;
        this.props.dispatch(
            fetchData({
                type: "GROUP",
                url: `/groups/${params.groupId}`
            })
        );
    };

    handleSubmit = async () => {
        const {params, location} = this.props;
        const {activeSlide} = this.state;

        // Find the character_id by activeSlide id
        let characterId = 0
        _.map(fn.getPeopleCharacters(), (character, index) => {
            if(index === activeSlide){
                characterId = character.id
            }
        })

        let formData = new FormData()
        formData.append('character_id', characterId)

        const response = await api.put(`/people/${params.personId}`, formData);

        if (!api.error(response)) {
            this.fetchGroup();
            let redirectUrl = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.people}`
            redirectUrl = location.query.zoom ? `${redirectUrl}?zoom=${location.query.zoom}` : redirectUrl
            fn.navigate(redirectUrl);
        }
    };

    handleCharacterPos(event, character) {
        event.preventDefault()
        this.setState({
            characterPos: true,
            selectedCharacter: {...character}
        })
    }

    handleCloseCharacterPosBox(event) {
        event.preventDefault()
        this.setState({
            characterPos: false,
            selectedCharacter: {}
        })
    }

    render() {
        const {popup, params, location} = this.props;
        const {step, characterPos, selectedCharacter} = this.state;
        const characters = fn.getPeopleCharacters();

        const sliderSettings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            beforeChange: (current, next) => this.setState({activeSlide: next}),
            initialSlide: (location.query.character) ? (location.query.character - 1) : 0
        };

        let cancelCharacterLink = `/${url.projects}/${params.id}/${url.groups}/${params.groupId}/${url.organisations}/${url.people}`
        cancelCharacterLink = location.query.zoom ? `${cancelCharacterLink}?zoom=${location.query.zoom}` : cancelCharacterLink

        return (
            <div className="character-container">
                <PeopleWrapper {...this.props}>
                    <Popup
                        additionalClass={step !== 4 ? `people` : "people small-window"}
                        title={popup.title ? `Person: ${popup.title}` : `New Person`}
                        closePath={`/${url.projects}/${params.id}/${url.groups}/${
                            params.groupId
                            }`}
                        buttons={
                            <React.Fragment>
                                <Link
                                    to={cancelCharacterLink}
                                    className="button"
                                >
                                    Cancel
                                </Link>
                                <span
                                    className="clickable button"
                                    onClick={this.handleSubmit}
                                >Choose</span>
                            </React.Fragment>
                        }
                    >
                        <div className="character-inner">
                            <p className="form-label form-label-title">Choose a character</p>
                            <Slider {...sliderSettings}>
                                {_.map(characters, (item) => (
                                    <div className="character-slide">
                                        <img
                                            className="character-image"
                                            src={`/../../../images/${item["largeImage"]}`}
                                        />
                                        <h3 className="character-title">{item["title"]}</h3>
                                        <p className="character-description">
                                            {item["description"]}
                                        </p>

                                        <div className="suggested-grid-content">
                                            <a href="#"
                                               onClick={(event) => this.handleCharacterPos(event, item)}
                                               className="suggested-grid"
                                            >Suggested grid position</a>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </Popup>
                </PeopleWrapper>

                {
                    characterPos ? <CharacterPosition {...this.props}
                                                      selectedCharacter={selectedCharacter}
                                                      handleCloseCharacterPosBox={(event) => this.handleCloseCharacterPosBox(event)}></CharacterPosition>
                        : null
                }
            </div>
        );
    }
}
