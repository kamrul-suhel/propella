import Store from 'app/store';
import { api, fn } from 'app/utils';
import { url as urlConstant } from 'app/constants';

export const showAlert = (payload) => {
	return {
		type: 'SHOW_ALERT',
		payload,
	};
};

export const hideAlert = () => {
	return {
		type: 'HIDE_ALERT',
	};
};

export const storeToken = (payload) => {
	return {
		type: 'STORE_TOKEN',
		payload,
	};
};

// custom middleware
export const rejectData = (payload, response) => {
	return {
		type: `${payload.type}_REJECTED`,
		payload: response,
	};
};

export const requestData = (payload) => {
	return {
		type: `${payload.type}_PENDING`,
	};
};

export const receiveData = (payload, response) => {
	const merge = payload.merge || false;
	const mergeId = payload.mergeId || null;
	const page = payload.page || 1;

	return {
		...payload,
		merge,
		mergeId,
		page,
		payload: response,
		receivedAt: Date.now(),
		type: `${payload.type}_FULFILLED`,
	};
};

const _fetchData = payload => (dispatch) => {
	dispatch(requestData(payload));
	return api.get(payload.url)
		.then((response) => {
			if (api.error(response)) {
				dispatch(rejectData(payload, response));

				/**
				 * 403: Forbidden
				 * 422: Validation Error
				 */
				if (response.status === 403 || response.status === 422 || response.status === 424) {
					return response;
				}
				// TODO: Can this be removed ?
				if (response.status === 404) {
					return fn.navigate(`/${urlConstant.notFound}`);
				}

				return fn.navigate({ pathname: `/${urlConstant.logout}`, state: { showDefaultAlert: false } });
			}
			dispatch(receiveData(payload, response));
			return response;
		});
};

export const fetchData = payload => (dispatch, getState) => dispatch(_fetchData(payload));
