<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

// Project route.
$router->group(['prefix' => 'v1/projects'] , function () use ($router) {
    $router->get('archives','ProjectController@projectWithArchive');
    $router->post('', 'ProjectController@create');
    $router->get('', 'ProjectController@list');
    $router->get('{id}/archives','ProjectController@archiveProject');
    $router->patch('/{id}', 'ProjectController@update');
    $router->put('/{id}', 'ProjectController@update');
    $router->get('/{id}', 'ProjectController@single');
    $router->get('/{id}/activate', 'ProjectController@activateProjectById');
    $router->delete('/{id}', 'ProjectController@delete');
});

// Group route.
$router->group(['prefix' => 'v1/groups'] , function () use ($router) {
    $router->post('', 'GroupController@create');
    $router->put('', 'GroupController@updateMultiple');
    $router->patch('/{id}', 'GroupController@update');
    $router->put('/{id}', 'GroupController@update');
    $router->get('', 'GroupController@list');
    $router->get('/{id}', 'GroupController@single');
    $router->get('/{id}/people', 'GroupController@getPeopleByGroupId');
    $router->delete('/{id}', 'GroupController@delete');
//    $router->get('/projects', 'GroupController@getAllProject');
});

// Organisation route.
$router->group(['prefix' => 'v1/organisations'] , function () use ($router) {
    $router->post('', 'OrganisationController@create');
    $router->put('', 'OrganisationController@updateMultiple');
    $router->get('', 'OrganisationController@list');
    $router->get('/{id}', 'OrganisationController@single');
    $router->put('/{id}', 'OrganisationController@update');
    $router->delete('/{id}', 'OrganisationController@delete');
});

// OrganisationType route
$router->group(['prefix' => 'v1/organisation-types'] , function () use ($router) {
    $router->post('', 'OrganisationTypeController@create');
    $router->get('', 'OrganisationTypeController@list');
    $router->get('{id}', 'OrganisationTypeController@single');
    $router->put('', 'OrganisationTypeController@updateMultiple');
    $router->put('{id}', 'OrganisationTypeController@update');
    $router->delete('{id}', 'OrganisationTypeController@delete');
});

// People route.
$router->group(['prefix' => 'v1/people'] , function () use ($router) {
    $router->post('', 'PeopleController@create');
    $router->put('', 'PeopleController@updateMultiple');
    $router->get('', 'PeopleController@list');
    $router->patch('{id}', 'PeopleController@update');
    $router->put('{id}', 'PeopleController@update');
    $router->get('{id}', 'PeopleController@single');
    $router->delete('/{id}', 'PeopleController@delete');
});

// PeopleType route
$router->group(['prefix' => 'v1/people-types'] , function () use ($router) {
    $router->get('{id}', 'PeopleTypeController@getPeopleTypeByUserGroupId');
    $router->post('', 'PeopleTypeController@create');
    $router->get('', 'PeopleTypeController@list');
    $router->put('', 'PeopleTypeController@updateMultiple');
    $router->put('{id}', 'PeopleTypeController@update');
    $router->delete('{id}', 'PeopleTypeController@delete');
});

// Competitors route
$router->group(['prefix' => 'v1/competitors'] , function () use ($router) {
    $router->post('', 'CompetitorsController@create');
    $router->put('{id}', 'CompetitorsController@update');
    $router->get('', 'CompetitorsController@list');
    $router->get('{id}', 'CompetitorsController@single');
    $router->delete('{id}', 'CompetitorsController@delete');
});

$router->group(['prefix' => 'v1/users'], function() use ($router){
    $router->get('', 'UserController@list');
    $router->get('/me', 'UserController@me');
});

$router->group(['prefix' => 'v1/user_types'], function() use ($router){
    $router->get('{id}', 'OrganisationTypeController@getOrganisationTypeByUserGroupId');
});

$router->group(['prefix' => 'v1/users'], function() use ($router){
    $router->get('{id}', 'UserController@getProjectUsers');
});
