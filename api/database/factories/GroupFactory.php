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

use App\Project;

$factory->define(App\Group::class, function (Faker\Generator $faker) {
    $projectId = Project::all()->random()->id;
    return [
        'title' => $faker->company('catchPhrase'),
        'description' => $faker->sentence(3),
        'abbreviation' =>$faker->address('regionAbbr'),
        'project_id' => $projectId,
        'created_by' => $faker->numberBetween(1, 10),
        'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
    ];
});
