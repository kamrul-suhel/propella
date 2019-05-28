import {api} from 'app/utils';

const defaultState = {};

export default function group(state = defaultState, action) {
    switch (action.type) {
        case '@@router/LOCATION_CHANGE':
        case 'POPUP_CLEARED': {
            return defaultState;
        }
        case 'POPUP_UPDATED': {
            return {
                ...state,
                ...action.payload,
            };
        }
        default: {
            return state;
        }
    }
}
