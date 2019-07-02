import {api} from 'app/utils';

const defaultState = {
    collection: {},
    currentCollection: [],
    error: null,
    isLoading: true,
    misc: {},
    pager: {},
    updatedOrganisations: [],
    updatedPeople: []
};

export default function group(state = defaultState, action) {
    switch (action.type) {
        case 'GROUP_PENDING': {
            return {
                ...state,
                isLoading: true,
            };
        }

        case 'GROUP_REJECTED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.data,
            };
        }

        case 'GROUP_FULFILLED': {
            const groupId = action.groupId
            const data = {...action.payload.data}

            let organisations = []
            let filterPeople = []

            // Check organisation position updated
            if (state.updatedOrganisations.length > 0) {
                _.map(data.organisations, (organisation) => {
                    const currentCollection = {...state.collection[groupId]}
                    if (_.includes(state.updatedOrganisations, organisation.id)) {
                        _.map(state.updatedOrganisations, (upOrganisation) => {
                            if (upOrganisation === organisation.id) {
                                const organisationIndex = _.findIndex(currentCollection.organisations, (g) => {
                                    return g.id === upOrganisation;
                                });

                                // When you create a new group that time, you do not have this object in your collection array
                                if(organisationIndex < 0){
                                    organisations.push(organisation)
                                }else{
                                    organisations.push(currentCollection.organisations[organisationIndex])
                                }
                            }
                        })
                    } else {
                        organisations.push(organisation)
                    }
                })
            } else {
                organisations = [...data.organisations]
            }

            // Check people position updated
            if (state.updatedPeople.length > 0) {
                _.map(data.people, (people) => {
                    const currentCollection = {...state.collection[groupId]}
                    if (_.includes(state.updatedPeople, people.id)) {
                        _.map(state.updatedPeople, (upPeople) => {
                            if (upPeople === people.id) {
                                const peopleIndex = _.findIndex(currentCollection.people, (p) => p.id === upPeople);
                                filterPeople.push(currentCollection.people[peopleIndex])
                            }
                        })
                    } else {
                        filterPeople.push(people)
                    }
                })
            } else {
                filterPeople = [...data.people]
            }

            const newAction = {
                ...action,
                payload: {
                    ...action.payload,
                    data: {
                        ...action.payload.data,
                        organisations: [...organisations],
                        people: [...filterPeople]
                    }
                }
            }

            const normalizedData = api.normalizeData(state, newAction);
            return {
                ...state,
                isLoading: false,
                ...normalizedData,
            };
        }
        case 'GROUP_UPDATED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.id]: action.payload
                }
            };
        }

        case 'GROUP_PEOPLE_ADDED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.groupId]: {
                        ...state.collection[action.payload.groupId],
                        people: [
                            ...state.collection[action.payload.groupId].people,
                            action.payload.person
                        ]
                    }
                }
            };
        }

        case 'GROUP_PEOPLE_UPDATED': {
            // Check is this people position has changed
            const groupId = action.payload.groupId
            const selectedPeopleId = +action.payload.personId  // change type to number for strict type check
            const updatedPeople = [...state.updatedPeople]
            let filterAction = {}

            if(updatedPeople.length > 0){
                if(_.includes(updatedPeople, selectedPeopleId)){
                    _.map(state.collection[groupId].people, (people) => {
                        if(selectedPeopleId === people.id){
                            let newPeople = {...action.payload.person}
                            newPeople.positionX = people.positionX
                            newPeople.positionY = people.positionY
                            filterAction = {
                                ...action,
                                payload:{
                                    ...action.payload,
                                    person: newPeople
                                }
                            }
                        }
                    })
                }else{
                    filterAction = {...action}
                }
            }else{
                filterAction = {...action}
            }

            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [groupId]: {
                        ...state.collection[groupId],
                        people: _.map(state.collection[groupId].people, (p) => {
                            return (filterAction.payload.person.id === p.id) ? filterAction.payload.person : p
                        })
                    }
                }
            };
        }

        case 'GROUP_ORGANISATION_UPDATED': {
            // Check is this organisation position has changed
            const groupId = action.payload.groupId
            const selectedOrganisationId = +action.payload.organisation.id // change type to number for strip type check
            const updatedOrganisations = [...state.updatedOrganisations]
            let filterAction = {}
            if(updatedOrganisations.length > 0){
                if(_.includes(updatedOrganisations, selectedOrganisationId)){
                    _.map(state.collection[groupId].organisations, (organisation) => {
                        if(selectedOrganisationId === organisation.id){
                            let newOrganisation = {...action.payload.organisation}
                            newOrganisation.positionX = organisation.positionX
                            newOrganisation.positionY = organisation.positionY
                            filterAction = {
                                ...action,
                                payload:{
                                    ...action.payload,
                                    organisation: newOrganisation
                                }
                            }
                        }
                    })
                }else{
                    filterAction = {...action}
                }
            }else{
                filterAction = {...action}
            }

            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [filterAction.payload.groupId]: {
                        ...state.collection[filterAction.payload.groupId],
                        organisations: _.map(state.collection[filterAction.payload.groupId].organisations, (o) => {
                            return (filterAction.payload.organisation.id === o.id) ? filterAction.payload.organisation : o
                        })
                    }
                }
            };
        }

        case 'DRAGGED_ORGANISATION_UPDATE': {
            // Put organisation id into updatedGroups
            let updatedOrganisations = [...state.updatedOrganisations];
            _.remove(updatedOrganisations, (o) => {
                return o === action.payload.organisation.id
            })
            if (!action.save) {
                updatedOrganisations.push(action.payload.organisation.id)
            }

            // Update organisation
            const organisationIndex = _.findIndex(state.collection[action.payload.groupId].organisations,
                (o) => o.id === action.payload.organisation.id);
            state.collection[action.payload.groupId].organisations[organisationIndex] = action.payload.organisation

            return {
                ...state,
                updatedOrganisations: [...updatedOrganisations],
                collection: state.collection
            }
        }

        case 'GROUP_PEOPLE_DELETED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.groupId]: {
                        ...state.collection[action.payload.groupId],
                        people: _.pickBy(state.collection[action.payload.groupId].people, (o) => o.id !== action.payload.personId)
                    }
                }
            };
        }

        case 'UPDATE_DRAGGED_PEOPLE': {

            let updatedPeople = [...state.updatedPeople];
            _.remove(updatedPeople, (o) => {
                return o === action.payload.people.id
            })

            if (!action.payload.save) {
                updatedPeople.push(action.payload.people.id)
            }

            // Update people
            const peopleIndex = _.findIndex(state.collection[action.payload.groupId].people,
                (p) => p.id === action.payload.people.id);
            state.collection[action.payload.groupId].people[peopleIndex] = {...action.payload.people}
            return {
                ...state,
                updatedPeople: [...updatedPeople],
                collection: {...state.collection}
            };
        }

        case 'DRAGGED_PEOPLE_RESET': {
            return {
                ...state,
                updatedPeople: []
            }
        }

        case 'DRAGGED_ORGANISATION_CLEAR': {
            return {
                ...state,
                updatedOrganisations: [],
            }
        }

        case 'GROUP_ORGANISATION_DELETED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.groupId]: {
                        ...state.collection[action.payload.groupId],
                        organisations: _.pickBy(state.collection[action.payload.groupId].organisations, (o) => o.id !== action.payload.organisationId)
                    }
                }
            };
        }

        case 'GROUP_RESET': {
            return {

            }
        }

        default: {
            return state;
        }
    }
}
