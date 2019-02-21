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
use Carbon\Carbon;

$factory->define(App\Group::class, function (Faker\Generator $faker) {
    $projectId = Project::all()->random()->id;

    $prevPositionX = 0;
    $prevPositionY = 0;
    $createdAt = Carbon::now()->addDay($faker->numberBetween(5, 50));

    $positionX = $prevPositionX == 0 ? $faker->numberBetween(10, 50) : $prevPositionX + $faker->numberBetween(5, 15);
    $positionY = $prevPositionY == 0 ? $faker->numberBetween(10, 50) : $prevPositionY + $faker->numberBetween(5, 15);
    return [
        'title' => $faker->company('catchPhrase'),
        'description' => $faker->sentence(3),
        'abbreviation' =>$faker->address('regionAbbr'),
        'project_id' => $projectId,
        'created_by' => $faker->numberBetween(1, 10),
        'icon_size' => $faker->randomElement(['s','m','l']),
        'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
        'positionX' => $positionX,
        'positionY' => $positionY,
        'created_at' => $createdAt,
        'updated_at' => $createdAt,
        'status' => 1 // 0 disabled, 1 active, 2 deleted
    ];
});
