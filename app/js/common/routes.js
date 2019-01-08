import React from 'react';
import { IndexRedirect, IndexRoute, Route } from 'react-router';
import { url } from 'app/constants';
import * as C from 'app/containers';
import * as Group from 'app/containers/group';
import * as Project from 'app/containers/project';

/**
 * Route props
 *
 * @param   {Object}   	path			Paths are imported from constants.js
 * @param   {Object}   	component		Components are imported from the containers folder
 * @param   {Array}   	accessLevel		The array contains the user role string. If not set all user roles can acces. ['admin', 'user']
 */
const Routes = (
	<Route component={C.GridWrapper}>
		<Route path={url.projects}>
			<Route path=":id" >
				<IndexRoute component={Project.View} />
				<Route path={url.groups}>
					<IndexRoute component={Group.List} />
					<Route path="add" component={Group.Edit} />
				</Route>
			</Route>
		</Route>
	</Route>
);

export default Routes;
