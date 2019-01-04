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
        factory(\App\Project::class, 100)->create();

        // Seed people type.
        factory(\App\PeopleType::class, 200)->create();


        // Seeding group table.
        factory(\App\Group::class, 200)->create();

        // Seed organisation type first then organisation.
        factory(\App\OrganisationType::class, 200)->create();

        // Seed organisation table.
        factory(\App\Organisation::class, 300)->create();


        //Seed people table.
        factory(\App\People::class, 400)->create();

        // Seed Competitors
        factory(\App\Competitor::class, 600)->create();
    }
}
