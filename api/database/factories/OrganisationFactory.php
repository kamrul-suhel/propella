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


$factory->define(App\Organisation::class, function (Faker\Generator $faker) {

    // Get group id
    $groupId = \App\Group::all()->random()->id;

    // get the organisation type id
    $organasitionTypeId = \App\OrganisationType::all()->random()->id;

    return [
        'title' => $faker->company('company'),
        'description' => $faker->sentence(3),
        'abbreviation' =>$faker->address('regionAbbr'),
        'group_id' => $groupId,
        'type_id' => $organasitionTypeId,
        'created_by' => $faker->numberBetween(1, 10),
        'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
    ];
});
