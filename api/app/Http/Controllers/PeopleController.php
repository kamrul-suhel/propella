<?php

namespace App\Http\Controllers;

use App\Group;
use App\Organisation;
use App\People;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use DB;

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
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
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
            'abbreviation' => 'string|min:1',
            'icon_size' => 'in:s,m,l,f',
            'character_id' => 'integer|min:1',
            'created_by' => 'integer|min:1',
            'status' => 'integer|between:0,2',
            'type_id' => 'required|exists:people_types,id',
            'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
        ]);

        $people = $this->savePeople();

        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        $people = $this->savePeople(false, $id);

        return response()->json($people);
    }

    public function updateMultiple()
    {
        $this->validate($this->request, [
            'people' => 'required|array',
            'people.*.id' => 'required|exists:people,id',
        ]);

        $people = $this->request->people;

        $result = [];

        foreach($people as $singlePeople){
            if(isset($singlePeople['id'])){
                $people =  People::findOrFail($singlePeople['id']);
                $existingPositionX = $people->positionX;
                $existingPositionY = $people->positionY;

                isset($singlePeople['title']) ? $people->title = $singlePeople['title'] : '';
                isset($singlePeople['description']) ? $people->description = $singlePeople['description'] : '';
                isset($singlePeople['status']) ? $people->status = $singlePeople['status'] : '';
                isset($singlePeople['type_id']) ? $people->type_id = (int)$singlePeople['type_id'] : '';
                isset($singlePeople['organisation_id']) ? $people->organisation_id = (int) $singlePeople['organisation_id'] : '';
                isset($singlePeople['abbreviation']) ? $people->abbreviation = ucwords($singlePeople['abbreviation']) : '';
                isset($singlePeople['positionX']) ? $people->positionX = $singlePeople['positionX'] : '';
                isset($singlePeople['positionY']) ? $people->positionY = $singlePeople['positionY'] : '';
                isset($singlePeople['trajectory']) ? $people->trajectory = $singlePeople['trajectory'] : '';
                isset($singlePeople['character_id']) ? $people->character_id = $singlePeople['character_id'] : '';
                isset($singlePeople['icon_size']) ? $people->icon_size = $singlePeople['icon_size'] : '';

                // First check is has file.
                if (isset($singlePeople['icon_path']) && is_file('icon_path')) {
                    // Remove existing file.
                    propellaRemoveImage($people->icon_path);

                    $newIconPath = propellaUploadImage($singlePeople['icon_path'], $this->folderName);
                    $people->icon_path = $newIconPath;
                }

                $people->save();

                // Send email if position X & Y more then 50
                if (isset($singlePeople['positionX']) &&
                    isset($singlePeople['positionX']) &&
                    $singlePeople['positionX'] >= 50 &&
                    $singlePeople['positionY'] >= 50
                ) {

                    if ($existingPositionX < 50) {
                        // Get User email
                        $groupUser = DB::table('wp_users')
                            ->select('user_email')
                            ->where('ID', $people['created_by'])
                            ->first();

                        Mail::send('email.notification.notification', ['data' => $people->toArray()], function ($message) use ($groupUser) {
                            $message->to($groupUser->user_email, 'VIP user')
                                ->subject('VIP user');
                            $message->from(env('MAIL_FROM_ADDRESS'));
                        });
                    } else {
                        if ($existingPositionY < 50) {
                            // Get User email
                            $groupUser = DB::table('wp_users')
                                ->select('user_email')
                                ->where('ID', $people['created_by'])
                                ->first();

                            Mail::send('email.notification.notification', ['data' => $people->toArray()], function ($message) use ($groupUser) {
                                $message->to($groupUser->user_email, 'VIP user')
                                    ->subject('VIP user');
                                $message->from(env('MAIL_FROM_ADDRESS'));
                            });
                        }
                    }
                }

                $organisation = Organisation::findOrFail($people->organisation_id);
                $people->organisation_id = $organisation->id;
                $people->organisation_title = $organisation->title;

                $result[] = $people;
            }
        }

        return response()->json($result);
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

        $ids = People::getAllId($people->parent_id);
        $coordinates = People::select([
            'id',
            'positionX',
            'positionY',
            'icon_size',
            'icon_path'
        ])
            ->whereIn('id', $ids)
            ->get();
        $people->coordinates = $coordinates;

        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $people = People::findOrFail($id);

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
        $people = $create ? new People() : People::findOrFail($id);
        $this->request->has('title') ? $people->title = $this->request->title : '';
        $this->request->has('description') ? $people->description = $this->request->description : '';
        $this->request->has('status') ? $people->status = $this->request->status : '';
        $this->request->has('type_id') ? $people->type_id = (int)$this->request->type_id : '';
        $this->request->has('organisation_id') ? $people->organisation_id = (int)$this->request->organisation_id : '';
        $this->request->has('abbreviation') ? $people->abbreviation = ucwords($this->request->abbreviation) : '';
        $this->request->has('positionX') ? $people->positionX = $this->request->positionX : '';
        $this->request->has('positionY') ? $people->positionY = $this->request->positionY : '';
        $this->request->has('trajectory') ? $people->trajectory = $this->request->trajectory : '';
        $this->request->has('character_id') ? $people->character_id = $this->request->character_id : '';
        $this->request->has('icon_size') ? $people->icon_size = $this->request->icon_size : '';

        if ($create) {
            $people->status = 1;
            $people->created_by = $this->request->authUserId;
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

        // Send email if position X & Y more then 50 & update
        if($this->request->has('positionX') &&
            $this->request->has('positionY') &&
            $this->request->positionX >= 50 &&
            $this->request->positionY >= 50 &&
            !$create
        ){
            // Get User email from table.
            $groupUser = DB::table('wp_users')
                ->select('user_email')
                ->where('ID', $people->created_by)
                ->first();

            Mail::send('email.notification.notification', ['data' => $people->toArray()], function($message) use($groupUser) {
                $message->to($groupUser->user_email, 'VIP user')
                    ->subject('VIP user');
                $message->from(env('MAIL_FROM_ADDRESS'));
            });
        }

        $organisation = Organisation::findOrFail($people->organisation_id);

        $people->organisation_id = $organisation->id;
        $people->organisation_title = $organisation->title;

        return $people;
    }
}
