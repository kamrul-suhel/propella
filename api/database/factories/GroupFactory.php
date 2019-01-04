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
        'icon_size' => $faker->randomElement([0,1]),
        'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
        'position_x' => $faker->numberBetween(10, 50),
        'position_y' => $faker->numberBetween(10, 50),
        'project_id' => $projectId,
        'created_by' => $faker->numberBetween(1, 10),
        'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
    ];
});
