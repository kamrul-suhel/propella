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
            ->with(['coordinate','people.coordinates'])
            ->findOrFail($id);

        // Take out
        $organisation->positionX = $organisation->coordinate[0]->positionX;
        $organisation->positionY = $organisation->coordinate[0]->positionY;
        $organisation->icon_size = $organisation->coordinate[0]->icon_size;
        $organisation->icon_path = $organisation->coordinate[0]->icon_path;
        $organisation->trajectory = $organisation->coordinate[0]->trajectory;

        unset($organisation->coordinate);

         $organisation->people->map(function($people){
            if($people->has('coordinates')){
                $people->positionX = $people->coordinates[0]->positionX;
                $people->positionY = $people->coordinates[0]->positionY;
                $people->icon_path = $people->coordinates[0]->icon_path;
                $people->icon_size = $people->coordinates[0]->icon_size;
                $people->trajectory = $people->coordinates[0]->trajectory;
            }
            unset($people->coordinates);
        });

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
            'positionX' => 'integer|min:1',
            'trajectory' => 'integer|min:1',
            'positionY' => 'integer|min:1',
            'icon_size' => 'in:s,m,l',
            'created_by' => 'integer|min:1',
            'status' => 'integer|between:0,2',
            'organisation_type' => 'required|string|min:1'
        ]);

        if ($create) {
            $this->validate($this->request, [
                'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
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
        $organisation->group_id = (int) $this->request->group_id;

        // Set status
        $organisation->status = $this->request->has('status') ? $this->request->status : 1;

        // set type_id
        $organisation->type_id = OrganisationType::getOrganisationTypeByTitle($this->request->organisation_type);

        // Set created by
        $organisation->created_by = $this->request->has('created_by') ? $this->request->created_by : 0;

        // Save group.
        $organisation->save();

        // Create organisation coordinate record.
        $organisationCoordinate = $this->request->has('coordinate_id') ? OrganisationCoordinate::find($this->request->coordinate_id) : new OrganisationCoordinate();

        $organisationCoordinate->positionX = $this->request->has('positionX') ? $this->request->positionX : 0;

        $organisationCoordinate->positionY = $this->request->has('positionY') ? $this->request->positionY : 0;

        $organisationCoordinate->trajectory = $this->request->has('trajectory') ? $this->request->trajectory : 0;

        $this->request->has('icon_size') ? $organisationCoordinate->icon_size = $this->request->icon_size : '';

        $organisationCoordinate->organisation_id = $organisation->id;

        // Upload file, if file exists & it is update.
        if ($create) {
            // Upload file
            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);

                // Set image path into database
                $organisationCoordinate->icon_path = $iconPath;
            }
        } else {
            // First check is has file.
            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                // Remove existing file.
                propellaRemoveImage($organisationCoordinate->icon_path);

                // Upload new file.
                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $organisationCoordinate->icon_path = $newIconPath;
            }else{
                // don't have icon_path so need to add previous icon_path.
                $iconPath = $organisation->coordinate()->first()->icon_path;
                $organisationCoordinate->icon_path = $iconPath;
            }
        }

        // Save organisation coordinate.
        $organisationCoordinate->save();

        $organisation->icon_size = $organisationCoordinate->icon_size;
        $organisation->icon_path = $organisationCoordinate->icon_path;
        $organisation->positionX = $organisationCoordinate->positionX;
        $organisation->positionY = $organisationCoordinate->positonY;
        $organisation->trajectory = $organisationCoordinate->trajectory;

        return $organisation;
    }


}
