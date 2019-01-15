<?php

use App\Group;
use App\Organisation;
use App\People;
use App\Project;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

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
        factory(\App\Project::class, 10)->create();

        // Seed people type.
        factory(\App\PeopleType::class, 100)->create();

        // Seeding group table.
        factory(\App\Group::class, 100)->create()->each(function($group){
            $faker = \Faker\Factory::create();
            $coordinatesItems = $faker->numberBetween(1, 4);
            $competitors = [];

            for($i = 0; $i < $coordinatesItems; $i++){
                $competitors[] = [
                    'title' => $faker->company('catchPhrase'),
                    'description' => $faker->sentence(3),
                    'status' => $faker->randomElement([0,1, 2]) // 0 disabled, 1 active, 2 deleted
                ];
            }

            // Create competitors
            $group->competitors()->createmany($competitors);
        });


        // Seed organisation type first then organisation.
        factory(\App\OrganisationType::class, 100)->create();

        // Seed organisation table.
        factory(\App\Organisation::class, 200)->create();

        //Seed people table.
        factory(\App\People::class, 400)->create();

        $faker = \Faker\Factory::create();
        $count = $faker->numberBetween(3,7);


        // Archive projects.
        for($i = 0; $i <= $count; $i++){
            $projectArchive = $faker->numberBetween(3,7);
            for($j = 0; $j <= $projectArchive; $j++){
                var_dump('Archiving all project '.$i);
                $projects = Project::where('archive', 0)
                    ->get();

                $this->archiveAll($projects);
            }
        }

    }

    private function archiveAll($projects){
        $projects->map(function($project){

            $project->archive = 1;
            $project->save();

            $newProject = $project->replicate();

            $newProject->archive = 0;
            $newProject->parent_id = $project->id;
            $newProject->save();

            // Get the groups.
            $groups = Group::where('project_id', $project->id)
                ->get();

            // Loop groups coordinate, insert last record & update previous record status.
            $groups->map(function ($group) use($newProject) {
                // Check if it has status 1

                $group->archive = 1;
                $group->save();

                // Duplicate record.
                $newGroup = $group->replicate();

                $newGroup->archive = 0;
                $newGroup->parent_id = $group->id;
                $newGroup->project_id = $newProject->id;

                $newGroup->save();

                // Archive the competitors
                $competitors = \App\Competitor::where('group_id', $group->id)
                    ->get();

                $competitors->map(function($competitor) use ($newGroup){
                    $competitor->archive = 1;
                    $competitor->save();

                    // Duplicate record.
                    $newCompetitor = $competitor->replicate();

                    $newCompetitor->archive = 0;
                    $newCompetitor->parent_id = $competitor->id;
                    $newCompetitor->group_id = $newGroup->id;

                    $newCompetitor->save();
                });

                // Archive the organisations.
                $organisations = Organisation::where('group_id', $group->id)
                    ->get();

                $organisations->map(function ($organisation) use($newGroup) {

                    $organisation->archive = 1;
                    $organisation->save();

                    // Duplicate record.
                    $newOrganisation = $organisation->replicate();
                    $newOrganisation->archive = 0;
                    $newOrganisation->parent_id = $organisation->id;
                    $newOrganisation->group_id = $newGroup->id;
                    $newOrganisation->save();

                    // Now people archive.
                    $people = People::where('organisation_id', $organisation->id)
                        ->get();

                    $people->map(function ($people) use($newOrganisation) {

                        $people->archive = 1;
                        $people->save();

                        $newPeople = $people->replicate();
                        $newPeople->archive = 0;
                        $newPeople->parent_id = $people->id;
                        $newPeople->organisation_id = $newOrganisation->id;

                        $newPeople->save();

//                    // Now check how many archive it has if more then 5 then change last record status status 2.
//                    $coordinateArchive = PeopleCoordinate::where('people_id', $people['id'])
//                        ->where('status', 0)
//                        ->orderBy('created_at', 'ASC')
//                        ->get();
//
//                    if ($coordinateArchive->count() > 5) {
//                        // Get the last coordinate record.
//                        $lastArchiveGroupCoordinate = PeopleCoordinate::findOrFail($coordinateArchive[0]->id);
//
//                        $lastArchiveGroupCoordinate->status = 2;
//
//                        $lastArchiveGroupCoordinate->save();
//                    }

                    });
                });
            });
        });
    }
}
