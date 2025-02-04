<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(App\Project::class, function (Faker\Generator $faker) {
    return [
        'title' => 'Project '. $faker->company('catchPhrase'),
        'description' => $faker->sentence(3),
        'status' => 1 // 0 disabled, 1 active, 2 deleted
    ];
});
