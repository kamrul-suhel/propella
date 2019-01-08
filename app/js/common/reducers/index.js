import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// reducers
import project from 'app/containers/project/reducer'
import group from 'app/containers/group/reducer'

const appReducer = combineReducers({
	project: project,
	group: group,
	routing: routerReducer,
});

const rootReducer = (state, action) => {
	// onlogout keep some of the previous state
	if (action.type === 'USER_LOGOUT') {
		state = {
			setting: state.setting,
		};
	}

	if (action.type === 'RESET_COLLECTION') {
		state[action.collection] = undefined;
	}

	return appReducer(state, action);
};
export default rootReducer;
