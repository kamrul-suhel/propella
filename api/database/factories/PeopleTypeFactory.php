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

$factory->define(App\PeopleType::class, function (Faker\Generator $faker) {
    return [
        'title' => $faker->company('jobTitle'),
        'user_group_id' => $faker->numberBetween(1,10)
    ];
});
