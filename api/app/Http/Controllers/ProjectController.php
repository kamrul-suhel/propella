<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
use App\Organisation;
use App\People;
use App\PeopleType;
use App\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProjectController extends PropellaBaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        parent::__construct($request);
    }

    /**
     * @return mixed
     */
    public function create()
    {
        $this->validate($this->request, [
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'status' => 'integer|between:1,3',
            'people' => 'array',
        ]);

        // Create project.
        $project = new Project();
        $project->title = $this->request->title;
        $project->description = $this->request->description;
        $project->status = $this->request->has('status') ? $this->request->status : 1;

        // Save project.
        $project->save();

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        // Find project
        $project = Project::findOrFail($id);

        $project->title = $this->request->title;
        $project->description = $this->request->description;
        $this->request->has('status') ? $project->status = $this->request->status : '';

        // Update project
        $project->save();
        return response()->json($project);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $projects = new Project();

        // project status, default it will give your 1, active records.
        $projects = $this->status != null ? $projects->where('status', $this->status) : $projects->whereIn('status', [0, 1]);

        $projects = $projects->where('archive', 0);
        $projects = $projects->paginate($this->perPage);

        // If has parameter archives then add last 5 archive.
        if ($this->request->has('archives') && $this->request->archives == 1) {
            foreach ($projects->items() as $project) {
                $ids = Project::getAllId($project->parent_id, $project->id);
                $archives = Project::select([
                    'id',
                    'updated_at'
                ])
                    ->whereIn('id', $ids)
                    ->orderBy('created_at', 'DESC')
                    ->get();

                $archives->map(function ($archive) {
                    return $archive->updated_at->format('l jS \of F, Y h:i:s A');
                });

                $project->archives = $archives;
            }
        }
        return response()->json($projects);
    }

    /**
     * @param $id
     * It will return all the related people type in project.
     * @return mixed
     */
    public function getPeopleType($id)
    {
        $peopleType = PeopleType::select([
            'id',
            'title'
        ])
            ->where('', $id)
            ->get();
        return response()->json($peopleType);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $project = Project::with(['groups.organisations.people'])
            ->findOrFail($id);

        $project->groups->map(function ($group) {
            $ids = Group::getAllId($group->parent_id);
            $groups = Group::select([
                'id',
                'positionX',
                'positionY',
                'icon_size',
                'icon_path'
            ])
                ->whereIn('id', $ids)
                ->get();
            $group->coordinates = $groups;
        });

        return response()->json($project);
    }

    public function activateProjectById($id)
    {
        $project = Project::findOrFail($id);
        $ids = Project::getAllId($project->parent_id, $project->id);

        // Find the activated project fist, then disable this project.
        $disableProject = Project::with([
                'groups.organisations.people',
                'groups.competitors'
            ])
            ->whereIn('id', $ids)
            ->where('archive', 0)
            ->first();

        if (!$disableProject) {
            return response()->json('No activate project found');
        }

        $activateProject = Project::findOrFail($id);
        $activateProject->archive = 0;
        $activateProject->save();

        $activateGroups = Group::where('project_id', $activateProject->id)
            ->get();

        $activateGroups->map(function($group){
            $group->archive = 0;
            $group->save();

            // Enable competitor
            $competitors = Competitor::where('group_id', $group->id)->get();
            $competitors->map(function($competitor){
                $competitor->archive = 0;
                $competitor->save();
            });

            // Enable organisations
            $organisations = Organisation::where('group_id', $group->id)->get();
            $organisations->map(function($organisation){
                $organisation->archive = 0;
                $organisation->save();

                // Enable people
                $people = People::where('organisation_id', $organisation->id)->get();

                $people->map(function($people){
                    $people->archive = 0;
                    $people->save();
                });
            });
        });


        // Disable activated project
        $disableProject->archive = 1;
        $disableProject->save();

        $disableProject->groups->map(function ($group) {
            // Disable group first.
            $group->archive = 1;
            $group->save();

            // Enable competitor
            $group->competitors->map(function($competitor){
                $competitor->archive = 1;
                $competitor->save();
            });

            $group->organisations->map(function ($organisation) {
                // Disable organisation first
                $organisation->archive = 1;
                $organisation->save();

                $organisation->people->map(function ($people) {
                    $people->archive = 1;
                    $people->save();
                });
            });
        });

        $data = ['active' => $activateProject, 'disable' => $disableProject];

        return response()->json($data);
    }


    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $project = Project::findOrFail($id);

        $project->status = 2;

        $project->save();

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function archiveProject($id)
    {
        $project = Project::findOrFail($id);

        $project->status = 5;
        $project->save();

        $newProject = $project->replicate();

        $newProject->parent_id = $project->id;
        $newProject->status = 1;
        $newProject->save();

        // Get the groups.
        $groups = Group::where('project_id', $project->id)
            ->get();

        // Loop groups coordinate, insert last record & update previous record status.
        $groups->map(function ($group) use ($newProject) {
            // Check if it has status 1

            $group->status = 5;
            $group->save();

            // Duplicate record.
            $newGroup = $group->replicate();

            $newGroup->status = 1;
            $newGroup->parent_id = $group->id;
            $newGroup->project_id = $newProject->id;

            $newGroup->save();

            // Now archive the organisations.
            $organisations = Organisation::where('group_id', $group->id)
                ->get();

            $organisations->map(function ($organisation) use ($newGroup) {

                $organisation->status = 5;
                $organisation->save();

                // Duplicate record.
                $newOrganisation = $organisation->replicate();
                $newOrganisation->parent_id = $organisation->id;
                $newOrganisation->group_id = $newGroup->id;
                $newOrganisation->status = 1;
                $newOrganisation->save();

                // Now people archive.
                $people = People::where('organisation_id', $organisation->id)
                    ->get();

                $people->map(function ($people) use ($newOrganisation) {

                    $people->status = 5;
                    $people->save();

                    $newPeople = $people->replicate();
                    $newPeople->parent_id = $people->id;
                    $newPeople->organisation_id = $newOrganisation->id;
                    $newPeople->status = 1;

                    $newPeople->save();
                });
            });
        });

        return response()->json($project);
    }
}
