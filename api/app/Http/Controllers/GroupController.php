<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
use App\GroupCoordinate;
use App\People;
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
        $groups = Group::with('project');

        // project status, default it will give your 1, active records.
        $status = $this->status == null ? [0,1] : $this->status;
        $groups = $groups->whereIn('status', $status);

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
        $group = Group::with(['coordinate','project', 'organisations.coordinates','organisations.people'])
            ->findOrFail($id);

//         set coordinate data.
        $group->positionX = $group->coordinate[0]->positionX;
        $group->positionY = $group->coordinate[0]->positionY;
        $group->icon_size = $group->coordinate[0]->icon_size;
        $group->icon_path = $group->coordinate[0]->icon_path;

        // get the organisation latest coordinate.
        $group->organisations->map(function($organisation){
           if($organisation->has('coordinates')){
               $organisation->positionX = $organisation->coordinates[0]->positionX;
               $organisation->positionY = $organisation->coordinates[0]->positionY;
               $organisation->icon_path = $organisation->coordinates[0]->icon_path;
               $organisation->icon_size = $organisation->coordinates[0]->icon_size;
               $organisation->trajectory = $organisation->coordinates[0]->trajectory;

               // Unset coordinates array
               unset($organisation->coordinates);
           }
        });

//         Unset coordinate for result.
        unset($group->coordinate);

        return response()->json($group);
    }


    /**
     * @param $id
     * @return mixed
     */
    public function getPeople($id){
        // Get the people
        $people = People::select([
            'people.title',
            'people.description',
            'organisations.id as organisation_id',
            'organisations.title as organisation',
            'groups.title as group'
        ])
            ->leftJoin('organisations', 'organisations.id', '=', 'people.organisation_id')
            ->leftJoin('groups', 'groups.id', '=', 'organisations.group_id')
            ->where('groups.id', $id)
        ->get();
        
        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $group = Group::findOrFail($id);

        // Remove record.
        $group->delete();

        return response()->json($group);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true)
    {
        $this->validate($this->request, [
            'coordinate_id' => 'sometimes|exists:group_coordinates,id',
            'positionX' => 'required|integer|min:1',
            'positionY' => 'required|integer|min:1',
            'icon_size' => 'required|in:s,m,l',
            'project_id' => 'required|exists:projects,id'
        ]);

        if ($create) {
            $this->validate($this->request, [
                'created_by' => 'integer|min:1',
                'status' => 'integer|between:0,2',
                'title' => 'required|string|min:1',
                'description' => 'required|string|min:1',
                'abbreviation' => 'required|string',
                'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
            ]);
        } else {
            $this->validate($this->request, [
                'id' => 'required|exists:groups,id',
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

        // Set project id
        $group->project_id = (int) $this->request->project_id;

        // Set status
        $group->status = $this->request->has('status') ? $this->request->status : 1;

        // Set created by
        $group->created_by = $this->request->has('created_by') ? $this->request->created_by : 0 ;

        // Save group.
        $group->save();

        // Create group coordinate record.
        $groupCoordinate = $this->request->has('coordinate_id') ? GroupCoordinate::find($this->request->coordinate_id) : new GroupCoordinate();

        $this->request->has('positionX') ? $groupCoordinate->positionX = $this->request->positionX : '';

        $this->request->has('positionY') ? $groupCoordinate->positionY = $this->request->positionY : '';

        $this->request->has('icon_size') ? $groupCoordinate->icon_size = $this->request->icon_size : '';

        $groupCoordinate->group_id = $group->id;

        // Upload file, if file exists & it is update.
        if ($create) {
            // Upload file
            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);

                // Set image path into database
                $groupCoordinate->icon_path = $iconPath;
            }
        } else {
            // First check is has file.
            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                // Remove existing file.
                propellaRemoveImage($groupCoordinate->icon_path);

                // Upload new file.
                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $groupCoordinate->icon_path = $newIconPath;
            }else{
                // don't have icon_path so need to add previous icon_path.
                $iconPath = $group->coordinate()->first()->icon_path;
                $groupCoordinate->icon_path = $iconPath;
            }
        }

        // Save coordinate.
        $groupCoordinate->save();

        // Create competitors
        if ($this->request->has('competitors')) {

            foreach ($this->request->competitors as $competitor) {
                $newCompetitor = isset($competitor['id']) ? Competitor::find($competitor['id']) : new Competitor();
                $newCompetitor->title = $competitor['title'];
                $newCompetitor->description = $competitor['description'];
                $newCompetitor->group_id = $group->id;
                $newCompetitor->status = $competitor['status'];

                // Save competitor.
                $newCompetitor->save();
            }
        }

        $group->positionX = $groupCoordinate->positionX;
        $group->positionY = $groupCoordinate->positionY;
        $group->icon_size = $groupCoordinate->icon_size;
        $group->icon_path = $groupCoordinate->icon_path;

        return $group;
    }


}
