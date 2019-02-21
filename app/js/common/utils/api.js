import axios from 'axios';
import _ from 'lodash';
import Store from 'app/store';
import { fn } from '.';

export default {

	/**
	 * Sends a get request to API
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   url		Request URL
	 * @return  {object}			Response or the error
	 */
	get(url) {
		return this.send(url, 'GET');
	},

	/**
	 * Sends a post request to API with the set data
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   url		Request URL
	 * @param   {object}   data		Form data
	 * @return  {object}			Response or the error
	 */
	post(url, data) {
		return this.send(url, 'POST', { data });
	},

	/**
	 * Sends an update request to API with the set data
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   url		Request URL
	 * @param   {object}   data		Form data
	 * @return  {object}			Response or the error
	 */
	put(url, data) {
		return this.send(url, 'PUT', { data });
	},

	/**
	 * Sends a delete request to API with the set data
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   url		Request URL
	 * @param   {object}   data		Form data
	 * @return  {object}			Response or the error
	 */
	delete(url, data) {
		return this.send(url, 'DELETE', { data });
	},

	/**
	 * Sends the request to API with the set method and data.
	 * This function sets the URL and the token, returns the response or catches the error.
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   url		Request URL which adds to the baseURL
	 * @param   {string}   method	Request method (GET, POST, PUT, DELETE)
	 * @param   {object}   data		Form data
	 * @return  {object}			Response or the error
	 */
	send(url, method, data) {

		// return new Promise(res => res());

		const token = fn.getCookie('token');
		data = _.assign({}, { method }, data);

		// const baseURL = process.env.RELEASE_STAGE === 'prod' ? 'http://api.propella.hostings.co.uk/v1' : 'http://api.propella.hostings.co.uk/v1';
		const baseURL = process.env.RELEASE_STAGE === 'prod' ? 'http://propella.test/v1' : 'http://propella.test/v1';
		axios.defaults.baseURL = baseURL;
		// axios.defaults.headers = { Authorization: `Bearer ${token}` };
		// axios.defaults.withCredentials = true;

		// include catalog ID on every GET request
		// const { currentCatalog } = Store.getState();
		// const prefix = url.indexOf('?') === -1 ? '?' : '&';
		// const catalogArg = (currentCatalog.id > 0 && method === 'GET') ? `${prefix}catalog_id=${currentCatalog.id}` : '';

		return axios(url, data)
			.then(response => response).catch((error) => {
				if (error.response) {
					return error.response;
				}

				console.error('Error', error.message);
				return false;
			});
	},

	/**
	 * Creates a better structured object from the received data, merges the previous data with the current data
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {object}   	state	Redux state
	 * @param   {object}   	action	Dispatched action with data payload
	 * @param   {string}   	key		Reducer type
	 * @return  {object}			Merged data
	 */
	cachedMergeData: {},
	normalizeData(state, action, key = 'id', mergeData = false) {
		let collection = {};
		let currentCollection = state.currentCollection;
		let pager = {};

		// get the resposne from api
		const { data } = action.payload;
		const isDataArray = _.isArray(data);

		// array of items
		if (isDataArray || 'data' in data) {
			const dataSet = isDataArray ? data : data.data;
			collection = _.keyBy(dataSet, o => o[key]);
			currentCollection = dataSet.map(o => o[key]);

			pager = {
				currentPage: data.current_page ? parseInt(data.current_page, 10) : 0,
				from: data.from,
				nextPageUrl: data.next_page_url,
				path: data.path,
				perPage: data.per_page ? parseInt(data.per_page, 10) : 0,
				prevPageUrl: data.prev_page_url,
				to: data.to,
				total: data.total,
			};

			// if merge is true then merges the previous currentCollection with the new currentCollection
			if (action.merge) {
				// if mergeId is provided then will keep merging until the mergeId is the same, then resets
				if (action.mergeId) {
					if (this.cachedMergeData[action.type] === action.mergeId) {
						currentCollection = _.union(state.currentCollection, currentCollection);
					}
					// cache the new mergeId
					this.cachedMergeData[action.type] = action.mergeId;
				} else {
					currentCollection = _.union(state.currentCollection, currentCollection);
				}
			}
		// single item
		} else {
			collection[data[key]] = data;
		}

		return {
			collection: mergeData ? _.merge({}, state.collection, collection) : { ...state.collection, ...collection },
			currentCollection,
			misc: data.misc || {},
			pager: {
				...state.pager,
				...pager,
			},
		};
	},

	/**
	 * Generates and shows the error message
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {object}	response 	API response
	 * @return  {boolean}				True if found error, false if not found
	 */
	error(response) {
		if (!response) {
			return true;
		}

		if (response.status === 200) {
			return false;
		}

		if (response.status === 424) {
			return true;
		}

		const errors = [];

		this.getErrors(errors, response.data);

		fn.showAlert(errors[0], 'error');
		return true;
	},

	getErrors(array = [], errors) {
		if (_.isObject(errors)) {
			_.map(errors, error => this.getErrors(array, error));
		} else {
			// check if server error then return a shorter message
			if (_.size(errors) > 2000) {
				return array.push('Something went wrong. Please try again later.');
			}
			return array.push(errors);
		}

		return false;
	},

};
