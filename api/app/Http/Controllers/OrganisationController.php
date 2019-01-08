<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
use App\GroupCoordinate;
use App\Organisation;
use App\OrganisationCoordinate;
use App\OrganisationType;
use Illuminate\Http\Request;

class OrganisationController extends PropellaBaseController
{
    private $folderName = 'organisation';

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
        // validate data.
        $this->validateData();

        // generate & save group.
        $organisation = $this->saveOrganisation();

        return response()->json($organisation);
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
        $organisation = $this->saveOrganisation(false);

        return response()->json($organisation);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisations = Organisation::getDefaultField()
            ->with(['coordinates']);

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
        $organisation = Organisation::getDefaultField()
            ->with(['coordinates'])
            ->findOrFail($id);

        return response()->json($organisation);
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
            'group_id' => 'required|exists:groups,id',
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'abbreviation' => 'required|string|min:1',
            'coordinate' => 'required|array',
            'coordinate.*.position_X' => 'required|integer|min:1',
            'coordinate.*.position_Y' => 'required|integer|min:1',
            'coordinate.*.icon_size' => 'required|in:s,m,l',
            'created_by' => 'required|integer|min:1',
            'status' => 'required|integer|between:0,2',
            'organisation_type_title' => 'required|string|min:1'
        ]);

        if ($create) {
            $this->validate($this->request, [
                'coordinate.*.icon_path' => 'required|file|mimes:jpeg,jpg,png,svg'
            ]);
        } else {
            $this->validate($this->request, [
                'id' => 'required|exists:organisations,id',
            ]);
        }
    }

    /**
     * @param bool $create
     * @return Group
     */
    private function saveOrganisation($create = true)
    {
        // Create new Group.
        $organisation = $create ? new Organisation() : Organisation::find($this->request->id);

        // Set title
        $organisation->title = $this->request->title;

        // Set description
        $organisation->description = $this->request->description;

        // Set abbreviation
        $organisation->abbreviation = $this->request->abbreviation;

        // Set project id
        $organisation->group_id = $this->request->group_id;

        // Set status
        $organisation->status = $this->request->status;

        // set type_id
        $organisation->type_id = OrganisationType::getOrganisationTypeByTitle($this->request->organisation_type_title);

        // Set created by
        $organisation->created_by = $this->request->created_by;

        // Save group.
        $organisation->save();

        // Create coordinate record.
        if ($this->request->has('coordinate')) {

            foreach ($this->request->coordinate as $coordinate) {
                $newCoordinate = isset($coordinate['id']) ? OrganisationCoordinate::find($coordinate['id']) : new OrganisationCoordinate();
                $newCoordinate->position_X = $coordinate['position_X'];
                $newCoordinate->position_Y = $coordinate['position_Y'];
                $newCoordinate->icon_size = $coordinate['icon_size'];
                $newCoordinate->organisation_id = $organisation->id;

                // Upload file if file exists & it is update.
                if ($create) {
                    // Upload file
                    $iconPath = propellaUploadImage($coordinate['icon_path'], $this->folderName);

                    // Set image path into database
                    $newCoordinate->icon_path = $iconPath;
                } else {
                    // First check is has file.
                    if(isset($coordinate['icon_path']) && is_file($coordinate['icon_path'])){
                        // Remove existing file.
                        propellaRemoveImage($newCoordinate->icon_path);

                        // Upload new file.
                        $newIconPath = propellaUploadImage($coordinate['icon_path'], $this->folderName);
                        $newCoordinate->icon_path = $newIconPath;
                    }else{
                        // don't have icon_path so need to add previous icon_path.
                        $iconPath = $organisation->coordinate()->first()->icon_path;
                        $newCoordinate->icon_path = $iconPath;
                    }
                }

                // Save coordinate.
                $newCoordinate->save();
            }
        }

        return $organisation;
    }


}
