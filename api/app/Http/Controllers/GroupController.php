<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
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
        parent::__construct($request);
    }

    /**
     * @return mixed
     */
    public function create()
    {
        // validate data
        $this->validate($this->request, [
            'positionX' => 'required|integer|min:1',
            'created_by' => 'integer|min:1',
            'status' => 'integer|between:0,2',
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1',
            'abbreviation' => 'string|min:1',
            'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif',
            'positionY' => 'required|integer|min:1',
            'icon_size' => 'required|in:s,m,l',
        ]);

        $group = $this->saveGroup();

        return response()->json($group);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        $group = $this->saveGroup(false, $id);

        return response()->json($group);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $groups = Group::with('project');

        // project status, default it will give your 0,1, active records.
        $status = $this->status == null ? [0,1] : [$this->status];
        $groups = $groups->whereIn('status', $status);
        $groups = $groups->where('archive', 0);

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
        // Get all group
        $group = Group::with([
            'organisations',
            'competitors'
        ])
            ->findOrFail($id);

        // Get the coordinates
        $groupIds = Group::getAllId($group->parent_id);
        $coordinates = Group::select([
            'id',
            'positionX',
            'positionY',
            'icon_path',
            'icon_size'
        ])
            ->whereIn('id', $groupIds)
            ->get();
        $group->coordinates = $coordinates;

        // Get people by group
        $people = People::select([
            'people.id',
            'people.title',
            'people.description',
            'people.positionX',
            'people.positionY',
            'people.icon_path',
            'people.icon_size',
            'people.trajectory',
            'people.parent_id',
            'people.character_id',
            'people.status',
            'people.created_at',
            'people.updated_at',
            'organisations.id as organisation_id',
            'organisations.title as organisation_title',
            'groups.title as group'
        ])
            ->leftJoin('organisations', 'organisations.id', '=', 'people.organisation_id')
            ->leftJoin('groups', 'groups.id', '=', 'organisations.group_id')
            ->where('groups.id', $id)
            ->whereIn('people.status', [0,1])
            ->get();

        $group->people = $people;

        return response()->json($group);
    }

    /**
     * @return mixed
     */
    public function getAllProject(){
        $projects = Group::with(['project' => function($query){
            $query->whereIn('status', [0,1]);
        }])
            ->where('status', [0,1])
            ->get()
            ->pluck('project')
            ->unique('id')
            ->values()
            ->all();

        return response()->json($projects);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function getPeopleByGroupId($id)
    {
        // Get the people
        $people = People::select([
            'people.id',
            'people.title',
            'people.description',
            'people.status',
            'people.positionX',
            'people.positionY',
            'people.icon_path',
            'people.icon_size',
            'people.trajectory',
            'people.character_id',
            'people.parent_id',
            'people.created_at',
            'people.updated_at',
            'organisations.id as organisation_id',
            'organisations.title as organisation_title',
            'groups.title as group'
        ])
            ->leftJoin('organisations', 'organisations.id', '=', 'people.organisation_id')
            ->leftJoin('groups', 'groups.id', '=', 'organisations.group_id')
            ->where('groups.id', $id)
            ->whereIn('people.status', [0,1])
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

        $group->status = 2;
        $group->save();
        return response()->json($group);
    }

    /**
     * @param bool $create
     * @return Group
     */
    private function saveGroup($create = true, $id=0)
    {
        // Create new Group
        $group = $create ? new Group() : Group::findOrFail($id);
        $group->title = $this->request->has('title') ? $this->request->title : '';
        $this->request->has('description') ? $group->description = $this->request->description : '';
        $this->request->has('abbreviation') ? $group->abbreviation = $this->request->abbreviation : '';
        $this->request->has('project_id') ? $group->project_id = $group->project_id = (int)$this->request->project_id : '';
        $this->request->has('status') ? $group->status = $this->request->status : '';
        $this->request->has('created_by') ? $group->created_by = $this->request->created_by : '';

        if($create){
            $group->status = 1;
            $this->request->has('created_by') ? $group->created_by = $this->request->created_by : 0;
        }

        $this->request->has('positionX') ? $group->positionX = $this->request->positionX : '';
        $this->request->has('positionY') ? $group->positionY = $this->request->positionY : '';
        $this->request->has('icon_size') ? $group->icon_size = $this->request->icon_size : '';

        // Upload file, if file exists & it is update
        if ($create) {
            // Upload file
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $group->icon_path = $iconPath;
            }
        } else {
            // First check it has file
            if ($this->request->has('icon_path') && $this->request->hasFile('icon_path')) {
                // Remove existing file
                propellaRemoveImage($group->icon_path);

                // Upload file
                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $group->icon_path = $newIconPath;
            }
        }

        $group->save();

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

        return $group;
    }
}
