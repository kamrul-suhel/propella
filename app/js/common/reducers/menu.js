import { createSelector } from 'reselect';

const defaultState = {
	collection: {},
	error: null
};

export function menu(state = defaultState, action) {
	switch	(action.type) {
		case 'MENU_PENDING': {
			return {
				...state
			};
		}
		case 'MENU_FULFILLED': {
			return {
				...state,
				collection: action.payload.data.data,
			};
		}
		default: {
			return state;
		}
	}
}

export const getMenu = state => state.menu;
export const makeGetMenu = () => createSelector([getMenu], obj => obj);
