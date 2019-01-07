<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->call('UsersTableSeeder');
        factory(\App\Project::class, 50)->create();

        // Seed people type.
        factory(\App\PeopleType::class, 200)->create();

        // Seeding group table.
        factory(\App\Group::class, 100)->create()->each(function($group){
            $faker = \Faker\Factory::create();
            $coordinatesItems = $faker->numberBetween(1, 4);

            $coordinates = [];
            $competitors = [];

            for($i = 0; $i < $coordinatesItems; $i++){
                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'position_x' => $faker->numberBetween(10, 50),
                    'position_y' => $faker->numberBetween(10, 50),
                ];

                $competitors[] = [
                    'title' => $faker->company('catchPhrase'),
                    'description' => $faker->sentence(3),
                    'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
                ];
            }
            $group->coordinates()->createMany($coordinates);

            // Create competitors
            $group->competitors()->createmany($competitors);
        });


        // Seed organisation type first then organisation.
        factory(\App\OrganisationType::class, 100)->create();

        // Seed organisation table.
        factory(\App\Organisation::class, 300)->create()->each(function($organisation){
            $faker = \Faker\Factory::create();
            $coordinatesItems = $faker->numberBetween(1, 4);

            $coordinates = [];

            for($i = 0; $i < $coordinatesItems; $i++){
                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'position_x' => $faker->numberBetween(10, 50),
                    'position_y' => $faker->numberBetween(10, 50),
                ];
            }
            $organisation->coordinates()->createMany($coordinates);
        });

        //Seed people table.
        factory(\App\People::class, 400)->create()->each(function($people){
            $faker = \Faker\Factory::create();
            $coordinatesItems = $faker->numberBetween(1, 4);

            $coordinates = [];

            for($i = 0; $i < $coordinatesItems; $i++){
                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'position_x' => $faker->numberBetween(10, 50),
                    'position_y' => $faker->numberBetween(10, 50),
                ];
            }
            $people->coordinates()->createMany($coordinates);
        });
    }
}
