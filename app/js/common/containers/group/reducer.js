import { api } from 'app/utils';

const defaultState = {
	collection: {},
	currentCollection: [],
	error: null,
	isLoading: true,
	misc: {},
	pager: {},
};

export default function group(state = defaultState, action) {
	switch	(action.type) {
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
		default: {
			return state;
		}
	}
}