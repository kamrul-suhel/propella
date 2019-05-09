import {api} from 'app/utils';

const defaultState = {
    collection: {},
    currentCollection: [],
    error: null,
    isLoading: true,
    misc: {},
    pager: {},
    updatedGroups: []
};

export function project(state = defaultState, action) {
    switch (action.type) {
        case 'PROJECT_PENDING': {
            return {
                ...state,
                isLoading: true,
            };
        }
        case 'PROJECT_REJECTED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.data,
            };
        }
        case 'PROJECT_FULFILLED': {
            const normalizedData = api.normalizeData(state, action);
            return {
                ...state,
                isLoading: false,
                ...normalizedData,
            };
        }
        case 'PROJECT_DELETED': {
            return {
                ...state,
                isLoading: false,
                collection: _.pickBy(state.collection, (o) => o.id !== action.payload.id)
            };
        }

        case 'GROUP_DELETED': {
            return {
                ...state,
                isLoading: false,
                collection: {
                    ...state.collection,
                    [action.payload.project_id]: {
                        ...state.collection[action.payload.project_id],
                        groups: _.pickBy(state.collection[action.payload.project_id].groups, (o) => o.id !== action.payload.id)
                    }
                }
            };
        }

        case 'GROUP_UPDATE': {
            const groupIndex = _.findIndex(state.collection[action.payload.project_id].groups,
                (o) => o.id === action.payload.group.id);
            state.collection[action.payload.project_id].groups[groupIndex] = action.payload.group

            // Put group id
            let updatedGroups = [...state.updatedGroups];
            _.remove(updatedGroups, (g)=> {return g === action.payload.group.id})
            updatedGroups.push(action.payload.group.id)

            return {
                ...state,
                updatedGroups:[...updatedGroups],
                isLoading: false,
                collection: state.collection
            }
        }
        case 'CLEAR_UPDATED_GROUP': {
            return {
                ...state,
                updatedGroups: []
            }
        }

        default: {
            return state;
        }
    }
}

const defaultProjectUserState = {
    collection: {},
    currentCollection: [],
    error: null,
    isLoading: true,
    misc: {},
    pager: {},
};

export function projectUser(state = defaultProjectUserState, action) {
    switch (action.type) {
        case 'PROJECT_USER_PENDING': {
            return {
                ...state,
                isLoading: true,
            };
        }

        case 'PROJECT_USER_REJECTED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.data,
            };
        }

        case 'PROJECT_USER_FULFILLED': {
            return {
                ...state,
                isLoading: false,
                collection: action.payload.data,
            };
        }

        default: {
            return state;
        }
    }
}

export const getProjectUsers = state => state.people;
export const makeGetProjectUsers = () => createSelector([getProjectUsers], obj => obj);