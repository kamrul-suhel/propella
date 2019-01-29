import { api } from 'app/utils';

const defaultState = {
	collection: {},
	currentCollection: [],
	error: null,
	isLoading: true,
	misc: {},
	pager: {},
};

export default function project(state = defaultState, action) {
	switch	(action.type) {
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
		default: {
			return state;
		}
	}
}
