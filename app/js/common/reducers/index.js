import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// reducers
import alert from './alert'
import me from './me'
import popup from './popup'
import { project, projectUser } from 'app/containers/project/reducer'
import group from 'app/containers/group/reducer'
import { organisation, organisationType } from 'app/containers/organisation/reducer'
import { people, peopleType } from 'app/containers/people/reducer'

const appReducer = combineReducers({
	alert: alert,
	popup: popup,
	project: project,
	organisation: organisation,
	organisationType: organisationType,
  people: people,
	peopleType: peopleType,
	group: group,
  projectUser: projectUser,
  me: me,
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
