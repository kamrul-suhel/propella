import { api } from 'app/utils';

const defaultState = {
	collection: {},
	currentCollection: [],
	error: null,
	isLoading: true,
	misc: {},
	pager: {},
};

export function people(state = defaultState, action) {
	switch	(action.type) {
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
		default: {
			return state;
		}
	}
}

export function peopleType(state = defaultState, action) {
	switch	(action.type) {
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
