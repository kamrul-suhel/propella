<?php

namespace App\Http\Controllers;

use App\Group;
use Illuminate\Http\Request;

class GroupController extends PropellaBaseController
{
    private $folderName = 'groups';

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

        // generate & save group.
        $group = $this->saveGroup();

        return response()->json($group);

    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        // Validate data
        $this->validateData(false);

        // Update existing group.
        $group = $this->saveGroup(false);

        return response()->json($group);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $groups = Group::with(['project']);

        // project status, default it will give your 1, active records.
        $this->status != null ? $groups->where('status', $this->status) : '';

        // return all data without pagination.
        $groups = $this->allData ? $groups->get() : $groups->paginate($this->perPage);

        return response()->json($groups);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $group = Group::with(['project', 'organisations'])
            ->findOrFail($id);

        return response()->json($group);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $project = Group::findOrFail($id);

        // If has file then delete file.
        propellaRemoveImage($project->icon_path);

        // Remove record.
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
            'abbreviation' => 'required|string',
            'icon_size' => 'required|integer|between:1,4',
            'position_x' => 'required|integer|min:1',
            'position_y' => 'required|integer|min:1',
            'project_id' => 'required|exists:projects,id',
            'created_by' => 'required|integer|min:1',
            'status' => 'required|integer|between:0,2'
        ]);

        if (!$create) {
            $this->validate($this->request, [
                'id' => 'required|exists:groups,id',
            ]);
        } else {
            $this->validate($this->request, [
                'icon' => 'required|file|mimes:jpeg,jpg,png,svg'
            ]);
        }
    }


    /**
     * @param bool $create
     * @return Group
     */
    private function saveGroup($create = true)
    {
        // Create new Group.
        $group = $create ? new Group() : Group::find($this->request->id);

        // Set title
        $group->title = $this->request->title;

        // Set description
        $group->description = $this->request->description;

        // Set abbreviation
        $group->abbreviation = $this->request->abbreviation;

        // Set position x
        $group->position_x = $this->request->position_x;

        // Set position_y
        $group->position_y = $this->request->position_y;

        // Set icon size.
        $group->icon_size = $this->request->icon_size;

        // Set project id
        $group->project_id = $this->request->project_id;

        // Set status
        $group->status = $this->request->status;

        // Set created by
        $group->created_by = $this->request->created_by;

        // Upload file if file exists & it is update.
        if ($create) {
            // Upload file
            $iconPath = propellaUploadImage($this->request->icon, $this->folderName);

            // Set image path into database
            $group->icon_path = $iconPath;
        } else {
            // Check is file exists or no, if yes then delete first then upload new image.
            if ($this->request->hasFile('icon')) {
                // Remove existing file.
                propellaRemoveImage($group->icon_path);

                // Upload new file.
                $newIconPath = propellaUploadImage($this->request->icon, $this->folderName);
                $group->icon_path = $newIconPath;
            }
        }

        // Save group.
        $group->save();

        return $group;
    }


}
