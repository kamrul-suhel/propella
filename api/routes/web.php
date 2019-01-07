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


$router->group(['prefix' => 'v1/projects'] , function () use ($router) {
    $router->post('/', 'ProjectController@create');
    $router->patch('/{id}', 'ProjectController@update');
    $router->get('/', 'ProjectController@list');
    $router->get('/{id}', 'ProjectController@single');
    $router->delete('/{id}', 'ProjectController@delete');
});

$router->group(['prefix' => 'v1/groups'] , function () use ($router) {
    $router->post('/', 'GroupController@create');
    $router->patch('/{id}', 'GroupController@update');
    $router->get('/', 'GroupController@list');
    $router->get('/{id}', 'GroupController@single');
    $router->delete('/{id}', 'GroupController@delete');
});

$router->group(['prefix' => 'v1/organisations'] , function () use ($router) {
    $router->post('/', 'OrganisationController@create');
    $router->get('/', 'OrganisationController@list');
    $router->get('/{id}', 'OrganisationController@single');
    $router->patch('/{id}', 'OrganisationController@update');
    $router->delete('/{id}', 'OrganisationController@delete');
});

$router->group(['prefix' => 'v1/people'] , function () use ($router) {
    $router->post('/', 'PeopleController@create');
    $router->patch('/{id}', 'PeopleController@update');
    $router->get('/', 'PeopleController@list');
    $router->get('/{id}', 'PeopleController@single');
    $router->delete('/{id}', 'PeopleController@delete');
});