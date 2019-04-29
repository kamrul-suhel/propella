import {fn, api} from 'app/utils';

const defaultState = {
    collection: {},
    currentCollection: [],
    error: null,
    isLoading: true,
    misc: {},
    pager: {},
    showCharacters: fn.getCookie('showCharacters') == 1 ? true : false
};

export function people(state = defaultState, action) {
    switch (action.type) {
        case 'PEOPLE_PENDING': {
            return {
                ...state,
                isLoading: true,
            };
        }
        case 'PEOPLE_REJECTED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.data,
            };
        }
        case 'PEOPLE_FULFILLED': {
            const normalizedData = api.normalizeData(state, action);
            return {
                ...state,
                isLoading: false,
                ...normalizedData,
            };
        }
        case 'TOGGLE_DISPLAY_CHARACTERS': {
            fn.toggleDisplayCharacters();
            const showCharacters = fn.shouldDisplayCharacters();
            return {
                ...state,
                showCharacters
            };
        }
        default: {
            return state;
        }
    }
}

export function peopleType(state = defaultState, action) {
    switch (action.type) {
        case 'PEOPLE_TYPE_PENDING': {
            return {
                ...state,
                isLoading: true,
            };
        }
        case 'PEOPLE_TYPE_REJECTED': {
            return {
                ...state,
                isLoading: false,
                error: action.payload.data,
            };
        }
        case 'PEOPLE_TYPE_FULFILLED': {
            const normalizedData = api.normalizeData(state, action);
            return {
                ...state,
                isLoading: false,
                ...normalizedData,
            };
        }
        default: {
            return state;
        }
    }
}

const defaultPeopleState = {
    people: [],
    draggedPeople: false
}

export function draggedPeople(state = defaultPeopleState, action){
    switch(action.type){
        case 'DRAGGED_PEOPLE_UPDATE':
            return {
                ...state,
                people: [...action.payload],
                draggedPeople: true
            }
            break;

        case 'DRAGGED_PEOPLE_CLEAR':
            return {
                ...state,
                people:[],
                draggedPeople: false
            }
            break;

        default:
            return {
                ...state
            }
    }
}
