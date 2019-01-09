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
        $carbon = Carbon::now();
        dd(Carbon::now());
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

            $prevPositionX = 0;
            $prevPositionY = 0;


            for($i = 0; $i < $coordinatesItems; $i++){
                $positionX = $prevPositionX == 0 ? $faker->numberBetween(10, 50) : $prevPositionX + $faker->numberBetween(5, 15);
                $positionY = $prevPositionY == 0 ? $faker->numberBetween(10, 50) : $prevPositionY + $faker->numberBetween(5, 15);

                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'positionX' => $positionX,
                    'positionY' => $positionY,
                ];

                $prevPositionX = $positionX;
                $prevPositionY = $positionY;

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

            $prevPositionX = 0;
            $prevPositionY = 0;

            for($i = 0; $i < $coordinatesItems; $i++){
                $positionX = $prevPositionX == 0 ? $faker->numberBetween(10, 50) : $prevPositionX + $faker->numberBetween(5, 15);
                $positionY = $prevPositionY == 0 ? $faker->numberBetween(10, 50) : $prevPositionY + $faker->numberBetween(5, 15);

                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'positionX' => $positionX,
                    'positionY' => $positionY,
                ];

                $prevPositionX = $positionX;
                $prevPositionY = $positionY;
            }
            $organisation->coordinates()->createMany($coordinates);
        });

        //Seed people table.
        factory(\App\People::class, 800)->create()->each(function($people){
            $faker = \Faker\Factory::create();
            $coordinatesItems = $faker->numberBetween(1, 4);

            $coordinates = [];
            $prevPositionX = 0;
            $prevPositionY = 0;

            for($i = 0; $i < $coordinatesItems; $i++){
                $positionX = $prevPositionX == 0 ? $faker->numberBetween(10, 50) : $prevPositionX + $faker->numberBetween(5, 15);
                $positionY = $prevPositionY == 0 ? $faker->numberBetween(10, 50) : $prevPositionY + $faker->numberBetween(5, 15);

                $coordinates[] = [
                    'icon_size' => $faker->randomElement(['s','m','l']),
                    'icon_path' => $faker->imageUrl(50, 50, 'cats', true, 'Faker'),
                    'positionX' => $positionX,
                    'positionY' => $positionY,
                    'trajectory' => $faker->randomElement([0,1]),
                    'character_id' => $faker->numberBetween(1, 20),
                ];

                $prevPositionX = $positionX;
                $prevPositionY = $positionY;
            }
            $people->coordinates()->createMany($coordinates);
        });
    }
}
