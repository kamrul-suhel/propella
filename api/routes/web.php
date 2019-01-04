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