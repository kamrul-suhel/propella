<?php

namespace App\Http\Controllers;

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
    public function create(){
        // validate data.
        $this->validateData();

        // Create project.
        $project = new Project();
        $project->title = $this->request->title;
        $project->description = $this->request->description;
        $project->status = $this->request->status;

        // Save project.
        $project->save();

        if($this->request->has('people')){
            $peoples = [];
            foreach($this->request->peoples as $people){
                $newPeople['title'] = $people['title'];
                $newPeople['status'] = $people['status'];
                $peoples[] = $newPeople;
            }

            $project->people()->createMany($peoples);
        }

        return response()->json($project);

    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id){

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
    public function list(){
        $projects = new Project();

        // project status, default it will give your 1, active records.
        $this->status != null ? $projects  = $projects->where('status', $this->status) : '';

        // return all data without pagination.
        $projects = $this->allData ? $projects->get() : $projects->paginate($this->perPage);

        return response()->json($projects);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id){
        $project = Project::with(['groups.coordinates', 'people'])
            ->findOrFail($id);
        
        return response()->json($project);

    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id){
        $project = Project::findOrFail($id);

        $project->delete();

        return response()->json($project);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true){
        $this->validate($this->request, [
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'status' => 'required|integer|between:1,3',
            'people' => 'array',
            'people.*.title' => 'required|string|min:1',
            'people.*.status' => 'required|integer|min:0'
        ]);

        if(!$create){
            $this->validate($this->request, [
                'id' => 'required|exists:projects,id',
            ]);
        }
    }


}
