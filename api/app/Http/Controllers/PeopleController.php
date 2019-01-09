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
        $people = People::with(['organisation', 'coordinate'])
            ->findOrFail($id);

        //set coordinate data.
        $people->positionX = $people->coordinate[0]->positionX;
        $people->positionY = $people->coordinate[0]->positionY;
        $people->icon_size = $people->coordinate[0]->icon_size;
        $people->icon_path = $people->coordinate[0]->icon_path;
        $people->trajectory = $people->coordinate[0]->trajectory;
        $people->character_id = $people->coordinate[0]->character_id;

        // Unset coordinate for result.
        unset($people->coordinate);

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
            'positionX' => 'required|integer|min:1',
            'positionY' => 'required|integer|min:1',
            'trajectory' => 'required|integer|min:1',
            'icon_size' => 'required|in:s,m,l',
            'character_id' => 'required|integer|min:1',
            'created_by' => 'integer|min:1',
            'status' => 'integer|between:0,2',
            'people_type' => 'required|string|min:1'
        ]);

        if ($create) {
            $this->validate($this->request, [
                'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
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
        $people->type_id = (int) $this->request->people_type;

        // Set created by
        $people->created_by = $this->request->created_by;

        // Set organisation_id
        $people->organisation_id = (int) $this->request->organisation_id;

        // Save group.
        $people->save();

        // Create organisation coordinate record.
        $peopleCoordinate = $this->request->has('coordinate_id') ? OrganisationCoordinate::find($this->request->coordinate_id) : new OrganisationCoordinate();

        $peopleCoordinate->positionX = $this->request->has('positionX') ? $this->request->positionX : 0;

        $peopleCoordinate->positionY = $this->request->has('positionY') ? $this->request->positionY : 0;

        $peopleCoordinate->trajectory = $this->request->has('trajectory') ? $this->request->trajectory : 0;

        $peopleCoordinate->character_id = $this->request->has('character_id') ? $this->request->character_id : 0;

        $this->request->has('icon_size') ? $peopleCoordinate->icon_size = $this->request->icon_size : '';

        $peopleCoordinate->people_id = $people->id;

        // Upload file, if file exists & it is update.
        if ($create) {
            // Upload file
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);

                // Set image path into database
                $peopleCoordinate->icon_path = $iconPath;
            }
        } else {
            // First check is has file.
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                // Remove existing file.
                propellaRemoveImage($peopleCoordinate->icon_path);

                // Upload new file.
                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $peopleCoordinate->icon_path = $newIconPath;
            } else {
                // don't have icon_path so need to add previous icon_path.
                $iconPath = $people->coordinate()->first()->icon_path;
                $peopleCoordinate->icon_path = $iconPath;
            }
        }

        // Save people coordinate.
        $peopleCoordinate->save();

        $people->positionX = $peopleCoordinate->positionX;
        $people->positionY = $peopleCoordinate->positionY;
        $people->icon_size = $peopleCoordinate->icon_size;
        $people->icon_path = $peopleCoordinate->icon_path;
        $people->trajectory = $peopleCoordinate->trajectory;
        $people->character_id = $peopleCoordinate->character_id;


        return $people;
    }
}
