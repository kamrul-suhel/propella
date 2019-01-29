const defaultState = {
  alerts: null,
  type: null,
  show: false
}

export default function reducer(state = defaultState, action) {
	switch (action.type) {
		case 'SHOW_ALERT': {
			return {
				...state,
				alerts: action.payload.alerts,
				type: action.payload.type,
				show: true,
			};
		}
		case '@@router/LOCATION_CHANGE':
		case 'HIDE_ALERT': {
			return {
				...state,
				alerts: null,
				type: null,
				show: false,
			};
		}
		default: {
			return state;
		}
	}
}
