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


$factory->define(App\PeopleCoordinate::class, function (Faker\Generator $faker) {
    return [
        'icon_path' => $faker->imageUrl(50, 50, 'people', true, 'Faker'),
        'icon_size' => $faker->imageUrl(50, 50, 'people', true, 'Faker'),
        'position_X' => $faker->numberBetween(10, 50),
        'position_Y' => $faker->numberBetween(10, 50),
        'character_id' => $faker->numberBetween(1, 20),
    ];
});
