import { api } from 'app/utils';

const defaultState = {
	collection: {},
	currentCollection: [],
	error: null,
	isLoading: true,
	misc: {},
	pager: {}
};

export function organisation(state = defaultState, action) {
	switch	(action.type) {
		case 'ORGANISATION_PENDING': {
			return {
				...state,
				isLoading: true,
			};
		}
		case 'ORGANISATION_REJECTED': {
			return {
				...state,
				isLoading: false,
				error: action.payload.data,
			};
		}
		case 'ORGANISATION_FULFILLED': {
			const normalizedData = api.normalizeData(state, action);
			return {
				...state,
				isLoading: false,
				...normalizedData,
			};
		}

		case 'ORGANISATION_UPDATE': {
			// Update organisation
			const organisationIndex = _.findIndex(state.collection[action.payload.groupId].organisations,
				(o) => o.id === action.payload.organisation.id);
			state.collection.organisations[organisationIndex] = action.payload.organisation

			return {
				...state,
				collection: state.collection
			}
		}

		case 'ORGANISATION_CLEAR': {
			// Update organisation
			return {
				...state,
				collection: {},
				currentCollection: [],
				error: null,
				isLoading: true,
				misc: {},
				pager: {}
			}
		}

		default: {
			return state;
		}
	}
}

export function organisationType(state = defaultState, action) {
	switch	(action.type) {
		case 'ORGANISATION_TYPE_PENDING': {
			return {
				...state,
				isLoading: true,
			};
		}
		case 'ORGANISATION_TYPE_REJECTED': {
			return {
				...state,
				isLoading: false,
				error: action.payload.data,
			};
		}
		case 'ORGANISATION_TYPE_FULFILLED': {
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
