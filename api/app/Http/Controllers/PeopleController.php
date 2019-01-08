<?php

namespace App\Http\Controllers;

use App\Group;
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
        $people = $this->savePeople();

        return response()->json($people);
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
        $organisation = $this->savePeople(false);

        return response()->json($organisation);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisations = People::with(['organisation', 'coordinates']);

        // project status, default it will give your 1, active records.
        $this->status != null ? $organisations = $organisations->where('status', $this->status) : '';

        // return all data without pagination.
        $organisations = $this->allData ? $organisations->get() : $organisations->paginate($this->perPage);

        return response()->json($organisations);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $organisation = People::with(['organisation', 'coordinates'])
            ->findOrFail($id);

        return response()->json($organisation);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $people = People::findOrFail($id);

        // If has file then delete file.
        propellaRemoveImage($people->icon_path);

        // Remove record.
        $people->delete();

        return response()->json($people);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true)
    {
        $this->validate($this->request, [
            'organisation_id' => 'required|exists:groups,id',
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'coordinate' => 'required|array',
            'coordinate.*.position_X' => 'required|integer|min:1',
            'coordinate.*.position_Y' => 'required|integer|min:1',
            'coordinate.*.icon_size' => 'required|in:s,m,l',
            'coordinate.*.character_id' => 'required|integer|min:1',
            'created_by' => 'required|integer|min:1',
            'status' => 'required|integer|between:0,2',
            'people_type' => 'required|string|min:1'
        ]);

        if ($create) {
            $this->validate($this->request, [
                'coordinate.*.icon_path' => 'required|file|mimes:jpeg,jpg,png,svg,gif'
            ]);
        } else {
            // Updating record, must need to know id.
            $this->validate($this->request, [
                'id' => 'required|exists:people,id',
            ]);
        }
    }

    /**
     * @param bool $create
     * @return Group
     */
    private function savePeople($create = true)
    {
        // Create new Group.
        $people = $create ? new People() : People::find($this->request->id);

        // Set title
        $people->title = $this->request->title;

        // Set description
        $people->description = $this->request->description;

        // Set status
        $people->status = $this->request->status;

        // set type_id
        $people->type_id = $this->request->people_type;

        // Set created by
        $people->created_by = $this->request->created_by;

        // Set organisation_id
        $people->organisation_id = $this->request->organisation_id;

        // Save group.
        $people->save();

        // Create coordinate record.
        if ($this->request->coordinate) {

            foreach ($this->request->coordinate as $coordinate) {
                $newCoordinate = isset($coordinate['id']) ? PeopleCoordinate::find($coordinate['id']) : new PeopleCoordinate();
                $newCoordinate->position_X = $coordinate['position_X'];
                $newCoordinate->position_Y = $coordinate['position_Y'];
                $newCoordinate->icon_size = $coordinate['icon_size'];
                $newCoordinate->character_id = $coordinate['character_id'];
                $newCoordinate->trajectory = $coordinate['trajectory'];
                $newCoordinate->people_id = $people->id;

                // Upload file if file exists & it is update.
                if ($create) {
                    // Upload file
                    $iconPath = propellaUploadImage($coordinate['icon_path'], $this->folderName);

                    // Set image path into database
                    $newCoordinate->icon_path = $iconPath;
                } else {
                    // First check is has file.
                    if (isset($coordinate['icon_path']) && is_file($coordinate['icon_path'])) {
                        // Remove existing file.
                        propellaRemoveImage($newCoordinate->icon_path);

                        // Upload new file.
                        $newIconPath = propellaUploadImage($coordinate['icon_path'], $this->folderName);
                        $newCoordinate->icon_path = $newIconPath;
                    } else {
                        // don't have icon_path so need to add previous icon_path.
                        $iconPath = $people->coordinate()->first()->icon_path;
                        $newCoordinate->icon_path = $iconPath;
                    }
                }

                // Save coordinate.
                $newCoordinate->save();
            }
        }
        return $people;
    }
}
