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

$factory->define(App\GroupCoordinate::class, function (Faker\Generator $faker) {
    return [
        'icon_size' => $faker->randomElement([0,1]),
        'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
        'position_x' => $faker->numberBetween(10, 50),
        'position_y' => $faker->numberBetween(10, 50),
    ];
});
