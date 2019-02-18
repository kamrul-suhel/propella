import React from 'react';
import {IndexRedirect, IndexRoute, Route} from 'react-router';
import {url} from 'app/constants';
import * as C from 'app/containers';
import * as Group from 'app/containers/group';
import * as Project from 'app/containers/project';
import * as Organisation from 'app/containers/organisation';
import * as People from 'app/containers/people';
import * as Competitor from 'app/containers/competitor';

/**
 * Route props
 *
 * @param   {Object}    path            Paths are imported from constants.js
 * @param   {Object}    component        Components are imported from the containers folder
 */
const Routes = (
    <Route component={C.GridWrapper}>
        <Route path={url.projects}>
            <Route path=":id" component={Project.Wrapper}>
                <IndexRoute component={Project.View}/>
                <Route path={url.groups}>
                    <IndexRoute component={Group.List}/>
                    <Route path=":groupId/edit" component={Group.Edit} type="edit"/>
                    <Route path="add" component={Group.Edit} type="add"/>
                </Route>
            </Route>
            // move outside so it's not wrapped by the main project
            <Route path={`:id/${url.groups}/:groupId`} component={Group.Wrapper}>
                <Route path="competitors" component={Competitor.List}/>
                <IndexRoute component={Group.View}/>
                <Route path="report" component={Group.Report} />
                <Route path={url.organisations}>
                    <IndexRoute component={Organisation.List}/>
                    <Route path=":organisationId" component={Organisation.Edit}/>
                </Route>
                <Route path={url.people}>
                    <IndexRoute component={People.List}/>
                    <Route path=":personId" component={People.Edit}/>
                </Route>
            </Route>
        </Route>
    </Route>
);

export default Routes;
