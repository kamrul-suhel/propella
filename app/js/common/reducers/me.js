import _ from 'lodash';

const defaultState = {
	data: {},
	error: null,
	isLoading: false,
};

export default function me(state = defaultState, action) {
	switch	(action.type) {
		case 'ME_PENDING': {
			return {
				...state,
				isLoading: true,
			};
		}
		case 'ME_REJECTED': {
			return {
				...state,
				isLoading: false,
				error: action.payload.data,
			};
		}
		case 'ME_FULFILLED': {
			return {
				...state,
				isLoading: false,
				data: _.assign({}, state.data, action.payload.data),
			};
		}
		case 'ME_UPDATE': {
			return {
				...state,
				data: _.assign({}, state.data, action.payload),
			};
		}
		default: {
			return state;
		}
	}
}
