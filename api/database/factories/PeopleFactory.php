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
        'icon_path' => $faker->imageUrl(50, 50, 'people', true, 'Faker'),
        'icon_preset' => $faker->imageUrl(50, 50, 'people', true, 'Faker'),
        'position_x' => $faker->numberBetween(10, 50),
        'position_y' => $faker->numberBetween(10, 50),
        'trajectory' => $faker->randomElement([0,1]),
        'character_id' => $faker->numberBetween(1, 50),
        'parent_id' => $faker->randomElement([0,1]),
        'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
    ];
});
