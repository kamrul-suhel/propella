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
        'parent_id' => $faker->randomElement([0,1]),
        'status' => $faker->randomElement([0,1])
    ];
});
