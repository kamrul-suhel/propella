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


$factory->define(App\People::class, function (Faker\Generator $faker) {

    // get the organisation type id
    $organasitionTypeId = \App\OrganisationType::all()->random()->id;

    // Get people type id.
    $peopleTypeId = \App\PeopleType::all()->random()->id;

    return [
        'title' => $faker->company('company'),
        'description' => $faker->sentence(3),
        'type_id' => $peopleTypeId,
        'organisation_id' => $organasitionTypeId,
        'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
    ];
});
