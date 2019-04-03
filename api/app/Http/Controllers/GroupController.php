<?php

namespace App\Http\Controllers;

use App\Competitor;
use App\Group;
use App\Organisation;
use App\People;
use Illuminate\Http\Request;
use DB;
use Illuminate\Support\Facades\Mail;

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
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function create()
    {
        // validate data
        $this->validate($this->request, [
            'positionX' => 'required|integer|min:1',
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
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function updateMultiple()
    {

        $this->validate($this->request, [
            'groups' => 'required|array',
            'groups.*.id' => 'required|exists:groups,id',
        ]);

        $result = [];
        $groups = $this->request->groups;
        foreach ($groups as $group) {
            if (isset($group['id'])) {
                $updateGroup = Group::findOrFail($group['id']);
                $existingPositionX = $updateGroup->positionX;
                $existingPositionY = $updateGroup->positionY;

                isset($group['rel_user_id']) ? $updateGroup->rel_user_id = $group['rel_user_id'] : '';
                isset($group['title']) ? $updateGroup->title = $group['title'] : '';
                isset($group['description']) ? $updateGroup->description = $group['description'] : '';
                isset($group['abbreviation']) ? $updateGroup->abbreviation = ucwords($group['abbreviation']) : '';
                isset($group['project_id']) ? $updateGroup->project_id = (int)$group['project_id'] : '';
                isset($group['status']) ? $updateGroup->status = $group['status'] : '';
                isset($group['positionX']) ? $updateGroup->positionX = $group['positionX'] : '';
                isset($group['positionY']) ? $updateGroup->positionY = $group['positionY'] : '';
                isset($group['icon_size']) ? $updateGroup->icon_size = $group['icon_size'] : '';
                // Upload file, if file exists & it is update
                if (isset($group['icon_path']) && is_file($group['icon_path'])) {
                    $iconPath = propellaUploadImage($group['icon_path'], $this->folderName);
                    $updateGroup->icon_path = $iconPath;
                }

                $updateGroup->save();

                // Send email if position X & Y more then 50
                if (isset($group['positionX']) &&
                    isset($group['positionX']) &&
                    $group['positionX'] >= 50 &&
                    $group['positionY'] >= 50
                ) {

                    if ($existingPositionX < 50) {
                        // Get User email
                        $groupUser = DB::table('wp_users')
                            ->select('user_email')
                            ->where('ID', $updateGroup['created_by'])
                            ->first();

                        Mail::send('email.notification.notification', ['data' => $updateGroup->toArray()], function ($message) use ($groupUser) {
                            $message->to($groupUser->user_email, 'VIP user')
                                ->subject('VIP user');
                            $message->from(env('MAIL_FROM_ADDRESS'));
                        });
                    } else {
                        if ($existingPositionY < 50) {
                            // Get User email
                            $groupUser = DB::table('wp_users')
                                ->select('user_email')
                                ->where('ID', $updateGroup['created_by'])
                                ->first();

                            Mail::send('email.notification.notification', ['data' => $updateGroup->toArray()], function ($message) use ($groupUser) {
                                $message->to($groupUser->user_email, 'VIP user')
                                    ->subject('VIP user');
                                $message->from(env('MAIL_FROM_ADDRESS'));
                            });
                        }
                    }
                }

                $result[] = $updateGroup;
            }
        }
        return response()->json($result);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $groups = Group::select(
            'groups.*',
            'wp_usermeta.meta_value AS profile_colour'
        )
            ->with('project')
            ->leftJoin('wp_usermeta', 'groups.rel_user_id', '=', DB::raw("wp_usermeta.user_id AND wp_usermeta.meta_key = 'profile_colour'"));

        // project status, default it will give your 0,1, active records.
        $status = $this->status == null ? [0, 1] : [$this->status];
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
        // If format_type param pass, download organisations as csv
        if ($this->request->has('format_type')) {
            $organisations = Organisation::where('group_id', $id)->get();
            
            if($organisations->isEmpty()){
                return response()->json('', 406);
            }

            $organisations->map(function ($organisation) {
                if ($organisation->positionX > 50) {
                    if ($organisation->positionY > 50) {
                        $organisation->quadrant = 'VIP';
                    } else {
                        $organisation->quadrant = 'STA';
                    }
                } else {
                    if ($organisation->positionY > 50) {
                        $organisation->quadrant = 'UP';
                    } else {
                        $organisation->quadrant = 'NF';
                    }
                }
            });

            $csv = getCsvString($organisations->toArray());
            $filename = 'organisation-' . date('U');
            header("Content-type: text/csv");
            header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
            return response()->make($csv, 200);
        }

        // Get all group
        $group = Group::select(
            'groups.*',
            'wp_usermeta.meta_value AS profile_colour'
        )
            ->leftJoin('wp_usermeta', 'groups.rel_user_id', '=', DB::raw("wp_usermeta.user_id AND wp_usermeta.meta_key = 'profile_colour'"))
            ->with(['organisations', 'competitors'])
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
            'people.abbreviation',
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
            ->whereIn('people.status', [1])
            ->get();

        $group->people = $people;

        return response()->json($group);
    }

    /**
     * @return mixed
     */
    public function getAllProject()
    {
        $projects = Group::with(['project' => function ($query) {
            $query->whereIn('status', [0, 1]);
        }])
            ->where('status', [0, 1])
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
            ->whereIn('people.status', [0, 1])
            ->get();

        if ($this->request->has('format_type')) {
            $people = $people->each(function ($people) {
                if ($people->positionX > 50) {
                    if ($people->positionY > 50) {
                        $people->quadrant = 'VIP';
                    } else {
                        $people->quadrant = 'STA';
                    }
                } else {
                    if ($people->positionY > 50) {
                        $people->quadrant = 'UP';
                    } else {
                        $people->quadrant = 'NF';
                    }
                }
            });

            $csv = getCsvString($people->toArray());
            $filename = 'people' . date('U');
            header("Content-type: text/csv");
            header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
            return response()->make($csv, 200);
        }

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
    private function saveGroup($create = true, $id = 0)
    {
        // Create new Group
        $group = $create ? new Group() : Group::findOrFail($id);
        $this->request->has('rel_user_id') ? $group->rel_user_id = $this->request->rel_user_id : '';
        $this->request->has('title') ? $group->title = $this->request->title : '';
        $this->request->has('description') ? $group->description = $this->request->description : '';
        $this->request->has('abbreviation') ? $group->abbreviation = ucwords($this->request->abbreviation) : '';
        $this->request->has('project_id') ? $group->project_id = $group->project_id = (int)$this->request->project_id : '';
        $this->request->has('status') ? $group->status = $this->request->status : '';

        if ($create) {
            $group->status = 1;
            $group->created_by = $this->request->authUserId;
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

        // Send email if position X & Y more then 50
        if ($this->request->has('positionX') &&
            $this->request->has('positionY') &&
            $this->request->positionX >= 50 &&
            $this->request->positionY >= 50 &&
            $create
        ) {
            // Send email if update

            // Get User email from table.
            $groupUser = DB::table('wp_users')
                ->select('user_email')
                ->where('ID', $group->created_by)
                ->first();

            Mail::send('email.notification.notification', ['data' => $group->toArray()], function ($message) use ($groupUser) {
                $message->to($groupUser->user_email, 'VIP user')
                    ->subject('VIP user');
                $message->from(env('MAIL_FROM_ADDRESS'));
            });
        }

        // Create, update or delete competitors
        if ($this->request->has('competitors')) {
            $createdCompetitors = [];
            $deletedCompetitors = [];

            if ($this->request->has('competitors.deleted')) {
                foreach ($this->request->competitors['deleted'] as $id) {
                    $competitor = Competitor::findOrFail($id);
                    $competitor->status = 0;
                    $competitor->update();
                    $deletedCompetitors[] = $competitor;
                }

                return $deletedCompetitors;
            }

            foreach ($this->request->competitors as $competitor) {

                // Check if has delete flag.
                $newCompetitor = isset($competitor['id']) ? Competitor::findOrFail($competitor['id']) : new Competitor();
                $newCompetitor->title = $competitor['title'];
                $newCompetitor->description = $competitor['description'];
                $newCompetitor->group_id = $group->id;
                $newCompetitor->status = isset($competitor['status']) ? $competitor['status'] : 1;

                // Save competitor
                $newCompetitor->save();
                $createdCompetitors[] = $newCompetitor;
            }
            return $createdCompetitors;
        }

        return $group;
    }

    public function getCompetitorsByGroupId($id)
    {
        $competitors = Competitor::where([
            ['status', '=', 1],
            ['archive', '=', 0],
            ['group_id', '=', $id]
        ])
            ->orderBy('created_at', 'DESC')
            ->limit(3)
            ->get();

        return response()->json($competitors);
    }
}
