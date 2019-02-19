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
