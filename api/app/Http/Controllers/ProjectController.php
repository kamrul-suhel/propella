<?php

namespace App\Http\Controllers;

use App\Group;
use App\PeopleType;
use App\Project;
use Illuminate\Http\Request;

class ProjectController extends PropellaBaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        //
        parent::__construct($request);
    }

    /**
     * @return mixed
     */
    public function create()
    {
        // validate data.
        $this->validateData();

        // Create project.
        $project = new Project();
        $project->title = $this->request->title;
        $project->description = $this->request->description;
        $project->status = $this->request->status;

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

        // Validate data
        $this->validateData(false);

        // Find project
        $project = Project::findOrFail($id);

        $project->title = $this->request->title;
        $project->description = $this->request->description;
        $project->status = $this->request->status;

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
        $this->status != null ? $projects = $projects->where('status', $this->status) : '';

        // return all data without pagination.
        $projects = $this->allData ? $projects->get() : $projects->paginate($this->perPage);

        return response()->json($projects);
    }

    /**
     * @param $id
     * It will return all the related people type in project.
     * @return mixed
     */
    public function getPeopleType($id){
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
        $project = Project::with(['groups'])
            ->findOrFail($id);

        $project->groups->map(function ($group) {
            $group->positionX = isset($group->coordinates[0]) ? $group->coordinates[0]->positionX : '';
            $group->positionY = isset($group->coordinates[0]) ? $group->coordinates[0]->positionY : '';
            $group->icon_size = isset($group->coordinates[0]) ? $group->coordinates[0]->icon_size : '';
            $group->icon_path = isset($group->coordinates[0]) ? $group->coordinates[0]->icon_path : '';

            unset($group->coordinates);
        });

        return response()->json($project);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $project = Project::findOrFail($id);

        $project->delete();

        return response()->json($project);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true)
    {
        $this->validate($this->request, [
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'status' => 'required|integer|between:1,3',
            'people' => 'array',
            'people.*.title' => 'string|min:1',
            'people.*.status' => 'integer|min:0'
        ]);

        if (!$create) {
            $this->validate($this->request, [
                'id' => 'required|exists:projects,id',
            ]);
        }
    }


}
