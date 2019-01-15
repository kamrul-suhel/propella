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
    $organasitionId = \App\Organisation::all()->random()->id;

    // Get people type id.
    $peopleTypeId = \App\PeopleType::all()->random()->id;

    $prevPositionX = 0;
    $prevPositionY = 0;
    $positionX = $prevPositionX == 0 ? $faker->numberBetween(10, 50) : $prevPositionX + $faker->numberBetween(5, 15);
    $positionY = $prevPositionY == 0 ? $faker->numberBetween(10, 50) : $prevPositionY + $faker->numberBetween(5, 15);


    return [
        'title' => $faker->company('company'),
        'description' => $faker->sentence(3),
        'type_id' => $peopleTypeId,
        'organisation_id' => $organasitionId,
        'created_by' => $faker->numberBetween(1, 10),
        'icon_size' => $faker->randomElement(['s','m','l']),
        'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
        'positionX' => $positionX,
        'positionY' => $positionY,
        'trajectory' => $faker->randomElement([0,1]),
        'character_id' => $faker->numberBetween(1, 20),
        'status' => $faker->numberBetween(0,1) // 0 disabled, 1 active, 2 deleted
    ];
});
