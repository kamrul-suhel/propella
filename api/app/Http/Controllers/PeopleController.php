<?php

namespace App\Http\Controllers;

use App\Group;
use App\Organisation;
use App\People;
use App\PeopleCoordinate;
use Illuminate\Http\Request;

class PeopleController extends PropellaBaseController
{
    private $folderName = 'people';

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
            'organisation_id' => 'required|exists:organisations,id',
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'positionX' => 'required|integer|min:1',
            'positionY' => 'required|integer|min:1',
            'trajectory' => 'integer|min:1',
            'icon_size' => 'in:s,m,l',
            'character_id' => 'integer|min:1',
            'created_by' => 'integer|min:1',
            'status' => 'integer|between:0,2',
            'type_id' => 'required|exists:people_types,id',
            'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
        ]);
        // generate & save group.
        $people = $this->savePeople();

        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        // Update existing group.
        $organisation = $this->savePeople(false, $id);

        return response()->json($organisation);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisations = People::with(['organisation'])
            ->whereIn('status', [0, 1])
            ->where('archive', 0)
            ->get();

        return response()->json($organisations);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $people = People::with(['organisation'])
            ->findOrFail($id);

        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $people = People::findOrFail($id);

        // If has file then delete file.
        $people->status = 2;

        $people->save();

        return response()->json($people);
    }

    /**
     * @param bool $create
     * @return Group
     */
    private function savePeople($create = true, $id = 0)
    {
        // Create new Group
        $people = $create ? new People() : People::findOrFail($id);
        $this->request->has('title') ? $people->title = $this->request->title : '';
        $this->request->has('description') ? $people->description = $this->request->description : '';
        $this->request->has('status') ? $people->status = $this->request->status : '';
        $this->request->has('type_id') ? $people->type_id = (int)$this->request->type_id : '';
        $this->request->has('created_by') ? $people->created_by = $this->request->created_by : '';
        $this->request->has('organisation_id') ? $people->organisation_id = (int)$this->request->organisation_id : '';
        $this->request->has('positionX') ? $people->positionX = $this->request->positionX : '';
        $this->request->has('positionY') ? $people->positionY = $this->request->positionY : '';
        $this->request->has('trajectory') ? $people->trajectory = $this->request->trajectory : '';
        $this->request->has('character_id') ? $people->character_id = $this->request->character_id : '';
        $this->request->has('icon_size') ? $people->icon_size = $this->request->icon_size : '';

        if ($create) {
            $people->status = 1;
            $people->created_by = $this->request->has('created_by') ?  $this->request->created_by : 0;
            $people->character_id = $this->request->has('character_id') ?  $this->request->character_id : 0;

            // Upload file if exists
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);

                // Set image path into database
                $people->icon_path = $iconPath;
            }
        }else {
            // First check is has file.
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                // Remove existing file.
                propellaRemoveImage($people->icon_path);

                // Upload new file.
                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $people->icon_path = $newIconPath;
            }
        }

        $people->save();

        $organisation = Organisation::findOrFail($people->organisation_id);

        $people->organisation_id = $organisation->id;
        $people->organisation_title = $organisation->title;

        return $people;
    }
}
