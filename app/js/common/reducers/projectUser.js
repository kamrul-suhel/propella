import { api } from 'app/utils';

const defaultState = {
	collection: {},
	currentCollection: [],
	error: null,
	isLoading: true,
	misc: {},
	pager: {},
};

export function projectUser(state = defaultState, action) {
	switch	(action.type) {
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

export const getProjectUsers = state => state.people;
export const makeGetProjectUsers = () => createSelector([getProjectUsers], obj => obj);
