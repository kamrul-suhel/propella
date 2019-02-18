import React from 'react';
import { browserHistory } from 'react-router';
import Cookie from 'universal-cookie';
import moment from 'moment';
import Store from 'app/store';
import { fetchData, hideAlert, showAlert, storeToken } from 'app/actions';
import { storageUrl, url } from 'app/constants';

const cookie = new Cookie();

export default {

	/**
	 * Shows alert
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {array}   alerts	Array of alerts
	 * @param   {array}   type		Type (success, warning, error)
	 */
	showAlert(alerts, type) {
		alerts = typeof alerts === 'string' ? [alerts] : alerts;
		Store.dispatch(showAlert({ alerts, type }));
	},

	/**
	 * Hides the currently showing alert
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {object}	Redux object
	 */
	hideAlert() {
		Store.dispatch(hideAlert());
	},

	escapeUrl(string) {
		if (!string.match(/^[a-zA-Z]+:\/\//)) {
			return `http://${string}`;
		}

		return string;
	},

	/**
	 * Deletes cookie by key
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   key	Stored cookie key
	 */
	deleteCookie(key) {
		return cookie.remove(key, { path: '/' });
	},

	/**
	 * Gets cookie by key
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   key	Stored cookie key
	 * @return  {string}		Value of the cookie
	 */
	getCookie(key) {
		return cookie.get(key);
	},

	/**
	 * Saves cookie
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   key		Cookie key
	 * @param   {string}   value	Cookie value
	 * @param   {object}   options	Options such as path, age, etc.
	 */
	saveCookie(key, value, options) {
		return cookie.set(key, value, options);
	},

	/**
	 * Gets token and return its value
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   key	Token key
	 * @return  {string}		Token value
	 */
	getToken(key) {
		const value = this.getCookie(key);
		Store.dispatch(storeToken(this.parseToken(value)));
		return this.parseToken(value);
	},

	/**
	 * Converts token to a readable json object
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   token	Token string
	 * @return  {object}			Formatted token object
	 */
	parseToken(token = '') {
		if (!token) {
			return '';
		}
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace('-', '+').replace('_', '/');
		return JSON.parse(window.atob(base64));
	},

	async downloadAttachment(fileUrl) {
		const blob = await fetch(`${storageUrl}${fileUrl}`, {
			method: 'get',
			headers: new Headers({
				Authorization: `Bearer ${this.getCookie('token')}`,
			}),
		}).then(r => r.blob());
		const fileName = /[^/]*$/.exec(fileUrl)[0];
		const csvURL = window.URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.href = csvURL;
		tempLink.setAttribute('download', fileName);
		tempLink.click();
	},

	/**
	 * Builds an url query.
	 *
	 * @param      {<type>}                         params  The parameters
	 * @param      {string}                         start   The start
	 * @return     {(string)}  The url query.
	 */
	buildUrlQuery(params = {}, start = '&') {
		if (_.isEmpty(params)) {
			return '';
		}

		let queryString = start;

		_.map(params, (value, key) => {
			if (key && value && value !== 'all') {
				// check if value is an array and split
				if (_.isArray(value)) {
					value = value.join(',');

					if (!value) {
						return false;
					}
				}

				queryString = `${queryString}${key}=${value}&`;
			}
		});

		return queryString.replace(/\&$/, '');
	},

	/**
	 * Formates date in the desired format
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @param   {string}   date		Date in YYYY-MM-DD HH:mm:ss format
	 * @param   {string}   format	Date format
	 * @return  {string}			Formatted date
	 */
	formatDate(date, format = 'D MMM YYYY') {
		if (!date || date === '0000-00-00 00:00:00') {
			return null;
		}

		const newDate = date !== 'now' ? date : null;
		return moment(newDate, 'YYYY-MM-DD hh:mm:ss').format(format);
	},

	/**
	 * Checks if the build is production
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {boolean}		True if production, false if development
	 */
	isProduction() {
		return process.env.NODE_ENV && process.env.NODE_ENV === 'production';
	},

	/**
	 * Navigate to an internal URL
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-31
	 */
	navigate(to) {
		// if to is goBack then go back to the previous page
		if (to === 'goBack') {
			browserHistory.goBack();
			return;
		}

		browserHistory.push(to);
	},

	/**
	 * Logs out the user, clears the redux object
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 */
	logOut() {
		this.user = '';
		this.deleteCookie('token');
		Store.dispatch({ type: 'USER_LOGOUT' });
	},

	/**
	 * Checks if user logged in or not
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {boolean}		True if logged in, false if logged out
	 */
	isLoggedIn() { // TODO: Cookie seemed to transfer from electralink, and this.getCookie returned true.
		// return false; // TODO: Remove
		if (this.getCookie('token')) {
			return true;
		}

		return false;
	},

	/**
	 * Gets the current logged in user
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {object}		User
	 */
	getUser() {
		// if user role set return
		if (this.user) {
			return this.user;
		}

		// get global store
		const store = Store.getState();

		// check if user is fetched and has role
		if (store.me.isLoading || !store.me.data) {
			return false;
		}

		// cache user role
		this.user = store.me.data;

		return this.user;
	},

	/**
	 * Checks if the current user is admin
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {boolean}		True if user is admin, false if user is not admin
	 */
	isAdmin() {
		if (this.getUser().role !== 'admin') {
			return false;
		}

		return true;
	},

	/**
	 * Checks if the current user is user
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {boolean}		True if user is user, false if user is not user
	 */
	isUser() {
		if (this.getUser().role !== 'user') {
			return false;
		}

		return true;
	},

	/**
	 * Checks if the provided user is the logged in user
	 *
	 * @author  Mark Homoki
	 * @version 1.0
	 * @since   2017-07-21
	 * @return  {boolean}		True if user matches
	 */
	isMe(id) {
		if (this.getUser().id !== id) {
			return false;
		}

		return true;
	},

	/**
	 * Retrieve the plural or single form based on the amount.
	 *
	 * @param      {<type>}  single  The single
	 * @param      {<type>}  plural  The plural
	 * @param      {number}  number  The number
	 * @return     {<type>}  { description_of_the_return_value }
	 */
	nGetText(single, plural, number) {
		// if number is 1, then return the single text
		if (number === 1) {
			return single;
		}

		return plural;
	},

	/**
	 * Makes a proptype required, if a condition is true.
	 *
	 * @param {function} type
	 * @param {function} condition
	 * @return {function}
	 */
	requiredIf(type, condition) {
		return function (props, propName, componentName) {
			if (typeof type !== 'function') {
				return new Error(
					`Invalid prop type supplied to ${componentName}. Validation failed`
				);
			}

			if (typeof condition !== 'function') {
				return new Error(
					`Invalid condition supplied to ${componentName}. Validation failed`
				);
			}

			const test = condition(props) ? type.isRequired : type;
			return test.apply(this, arguments);
		};
	},

	/**
	 * Converts a number into a string and formats it with commas and a decimal point.
	 *
	 * @param {number} amount
	 * @param {number} decimalCount
	 * @param {string} decimal
	 * @param {string} thousands
	 * @return {string}
	 */
	formatMoney(amount, decimalCount = 2, decimal = '.', thousands = ',') {

		const currencySign = '$';
		try {

			const dc = Number.isNaN(Math.abs(decimalCount)) ? 2 : decimalCount;

			const negativeSign = amount < 0 ? '-' : '';
			let a;
			const i = parseInt(a = Math.abs(Number(amount) || 0).toFixed(dc), 10).toString();
			const j = (i.length > 3) ? i.length % 3 : 0;

			return negativeSign + currencySign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) + (decimalCount ? decimal + Math.abs(a - i).toFixed(decimalCount).slice(2) : '');
		} catch (e) {
			return console.error(e);
		}
	},

	// get time delay in days between 2 dates
	timeSince(date, to = Date.now()) {
		const dateNow = new Date(date);
		const dateThen = new Date(to);
		return Math.floor((Date.UTC(dateThen.getFullYear(), dateThen.getMonth(), dateThen.getDate()) - Date.UTC(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate())) / (1000 * 60 * 60 * 24));
	},

	// Extract the filename including extension from a pull path
	getFilenameFromPath(url) {
		return url.substring(url.lastIndexOf('/') + 1);
	},

	/**
	 * Checks whether a user has completed and an admin activated the registration process.
	 *
	 * @return {boolean}
	 */
	shouldCompleteRegistration() {
		// get global store
		const { me } = Store.getState();

		// checks if a non-admin user has activated their registration
		if (this.isAdmin() || (!me.isLoading && (me.data.account_completion || {}).activated || me.data.role === 'company-general') ) {
			return false;
		}

		return true;//true
	},

	getReturnsProgressIndex(status) {
		let progressIndex;
		switch (status) {
			case 6:
				progressIndex = 5;
				break
			case 4:
			case 5:
			case 3:
				progressIndex = 3;
				break
			case 0:
				progressIndex = 1;
				break
			case 2:
			case 1:
			default:
				progressIndex = 2;
		}

		return progressIndex;
	},

	getAdminReturnsProgressIndex(status) {
		let progressIndex;
		switch (status) {
			case 6:
				progressIndex = 6;
				break
			case 4:
			case 5:
				progressIndex = 5;
				break
			case 3:
				progressIndex = 4;
				break
			case 0:
				progressIndex = 1;
				break
			case 2:
				progressIndex = 3;
				break
			case 1:
			default:
				progressIndex = 2;
		}

		return progressIndex;
	},

	getReturnProgressSteps() {
		return [
			{ title: '1. Registered Claim' },
			{ title: '2. Reviewed' },
			{ title: '3. Responded' },
			{ title: '3. Closed' },
		];
	},

	activeMaintenanceMode(settings) {
		const { setting, me } = Store.getState();

		// check if maintenance mode is set to enabled
		if( setting.maintenanceMode && me.data.role !== 'admin' ) {
			return true;
		}

		return false;
	},
        
        getImage(filename) {
            const imageDir = '../../../images';
            return `${imageDir}/${filename}`;
        },

	getContainer () {
		const container = document.getElementById('gridwrapper-inner')
		const containerHeight = (container || {}).offsetHeight || 0
		const containerWidth = (container || {}).offsetWidth || 0
		return {
			height: containerHeight,
			width: containerWidth
		}
	}
};
