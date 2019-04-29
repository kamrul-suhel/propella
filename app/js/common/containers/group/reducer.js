import {api} from 'app/utils';

const defaultState = {
    collection: {},
    currentCollection: [],
    error: null,
    isLoading: true,
    misc: {},
    pager: {}
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
            console.log(state.collection[action.payload.groupId])
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

const defaultDraggedState = {
    organisations: [],
    updateOrganisation: false

}
export function draggedOrganisations(state = defaultDraggedState, action){
    switch(action.type){
        case 'DRAGGED_ORGANISATION_UPDATE':
            return {
                ...state,
                organisations: [...action.payload],
                updatedOrganisation: true
            }
            break;

        case 'DRAGGED_ORGANISATION_CLEAR':
            return {
                ...state,
                organisations: [],
                updatedOrganisation: false
            }

        default:
            return {
                ...state
            }
    }
}
