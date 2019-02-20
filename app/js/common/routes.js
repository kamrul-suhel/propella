import React from 'react';
import {IndexRedirect, IndexRoute, Route} from 'react-router';
import {url} from 'app/constants';
import * as C from 'app/containers';
import * as Group from 'app/containers/group';
import * as Project from 'app/containers/project';
import * as Organisation from 'app/containers/organisation';
import * as People from 'app/containers/people';
import Report from 'app/containers/people/Report';
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
            <Route path=":id">
                <IndexRoute component={Project.View}/>
                <Route path={url.groups}>
                    <IndexRoute component={Group.List}/>
                    <Route path=":groupId">
                      <IndexRoute component={Group.View}/>

                      <Route path="edit" component={Group.Edit} type="edit"/>
                      <Route path="add" component={Group.Edit} type="add"/>

                        <Route path="competitors" component={Competitor.List}/>
                        <Route path={url.organisations}>
                            <IndexRoute component={Organisation.List}/>
                            <Route path={url.report} component={Organisation.Report} />
                            <Route path={url.people} component={People.PeopleWrapper} />
                            <Route path=":organisationId" component={Organisation.Edit}/>
                            <Route path={url.organisations} component={Organisation.Edit}/>
                        </Route>
                        <Route path={url.people}>
                            <IndexRoute component={People.List}/>
                            <Route path=":personId" component={People.Edit}/>
                            <Route path={url.report} component={Report}/>
                        </Route>
                    </Route>
                </Route>
            </Route>

        </Route>
    </Route>
);

export default Routes;
