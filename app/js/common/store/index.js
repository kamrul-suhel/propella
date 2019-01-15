import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import reducer from 'app/reducers';

const middleware = process.env.NODE_ENV === 'production' ? [thunk] : [thunk, createLogger()];

const composeMiddlewares = (() => {

	const appliedMiddlewares = applyMiddleware(...middleware);

	// check if redux devtools is enabled and also runs in development
	if (
		(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') &&
		window.__REDUX_DEVTOOLS_EXTENSION__
	) {
		return compose(
			appliedMiddlewares,
			window.__REDUX_DEVTOOLS_EXTENSION__(),
		);
	}

	return appliedMiddlewares;
})();

export default createStore(
	reducer,
	composeMiddlewares,
);
