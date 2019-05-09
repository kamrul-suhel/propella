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
            const normalizedData = api.normalizeData(state, action);
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
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.groupId]: {
                        ...state.collection[action.payload.groupId],
                        people: _.map(state.collection[action.payload.groupId].people, (p) => {
                          return (action.payload.person.id === p.id) ? action.payload.person : p
                        })
                    }
                }
            };
        }

        case 'GROUP_ORGANISATION_UPDATED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.groupId]: {
                        ...state.collection[action.payload.groupId],
                        organisations: _.map(state.collection[action.payload.groupId].organisations, (o) => {
                          return (action.payload.organisation.id === o.id) ? action.payload.organisation : o
                        })
                    }
                }
            };
        }

        case 'DRAGGED_ORGANISATION_UPDATE': {
            // Put organisation id into updatedGroups
            let updatedOrganisations = [...state.updatedOrganisations];
            _.remove(updatedOrganisations, (o)=> {return o === action.payload.organisation.id})
            updatedOrganisations.push(action.payload.organisation.id)

            // Update organisation
            const organisationIndex = _.findIndex(state.collection[action.payload.groupId].organisations,
                (o) => o.id === action.payload.organisation.id);
            state.collection[action.payload.groupId].organisations[organisationIndex] = action.payload.organisation

            return {
                ...state,
                updatedOrganisations:[...updatedOrganisations],
                collection: state.collection
            }
        }

        case 'DRAGGED_ORGANISATION_CLEAR': {
            return {
                ...state,
                updatedOrganisations:[],
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
            _.remove(updatedPeople, (o)=> {return o === action.payload.people.id})
            updatedPeople.push(action.payload.people.id)

            // Update organisation
            const peopleIndex = _.findIndex(state.collection[action.payload.groupId].people,
                (p) => p.id === action.payload.people.id);
            state.collection[action.payload.groupId].people[peopleIndex] = action.payload.people

            return {
                ...state,
                updatedPeople: [...updatedPeople],
                collection: {...state.collection}
            };
        }

        case 'CLEAR_DRAGGED_PEOPLE': {
            return {
                ...state,
                updatedPeople: []
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
        default: {
            return state;
        }
    }
}
