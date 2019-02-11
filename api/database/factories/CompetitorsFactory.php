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


$factory->define(App\Competitor::class, function (Faker\Generator $faker) {
    $groupId = \App\Group::all()->random()->id;

    return [
        'title' => $faker->company('catchPhrase'),
        'description' => $faker->sentence(3),
        'group_id' => $groupId,
        'status' => $faker->randomElement([0,1]) // 0 delete, 1 active
    ];
});
