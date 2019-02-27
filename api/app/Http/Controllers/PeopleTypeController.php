<?php

namespace App\Http\Controllers;

use App\Group;
use App\People;
use App\PeopleType;
use App\Project;
use Illuminate\Http\Request;

class PeopleTypeController extends PropellaBaseController
{
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
        $this->validate($this->request, [
            'types' => 'required|array',
            'types.*.user_group_id' => 'required|integer|min:1',
            'types.*.title' => 'required|string|min:1'
        ]);

        $people = $this->saveData();

        return response()->json($people);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        $peopleType = PeopleType::findOrFail($id);
        $this->request->has('title') ? $peopleType->title = $this->request->title: '';
        $this->request->has('user_group_id') ? $peopleType->user_group_id = $this->request->user_group_id : '';
        $this->request->has('status') ? $peopleType->status = $this->request->status : '';

        $peopleType->save();

        return response()->json($peopleType);
    }

    public function updateMultiple()
    {
        $this->validate($this->request, [
            'types'                 => 'required|array',
            'types.*.id'            => 'required|integer|min:0',
            'types.*.title'         => 'required|string|min:1',
            'types.*.user_group_id' => 'integer|min:0',
            'types.*.deleted'       => 'integer|min:0|max:1'
        ]);

        foreach($this->request->types as $type) {
            // New types will have id 0
            $peopleType = $type['id'] == 0 ? new PeopleType : PeopleType::findOrFail($type['id']);

            // Delete organisation that are marked as deleted
            if(isset($type['deleted']) && $type['deleted'] == 1) {
                $peopleType->delete();
                continue;
            }

            $peopleType->title         = $type['title'];
            $peopleType->user_group_id = $type['user_group_id'];
            $peopleType->save();
        }

        return response()->json(['success' => true]);
    }

    /**
     * @return array
     */
    private function saveData(){
        $people = [];
        if ($this->request->has('types')) {
            foreach ($this->request->types as $type) {

                $peopleType = $this->getPeopleTypeModel($type['user_group_id'], $type['title']);
                $peopleType->title = $type['title'];
                $peopleType->user_group_id = (int) $type['user_group_id'];

                $peopleType->save();
                $people[] = $peopleType;
            }
        }
        return $people;
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $peopleType = PeopleType::select([
            'id',
            'title',
            'user_group_id'
        ])->get();

        return response()->json($peopleType);
    }

    /**
     * @param $userGroupId
     * @return mixed
     */
    public function getPeopleTypeByUserGroupId($userGroupId){
        $peopleType = PeopleType::select([
            'id',
            'title'
        ])
            ->where('user_group_id', $userGroupId)
            ->get();

        return response()->json($peopleType);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $peopleType = PeopleType::findOrFail($id);
        
        return response()->json($peopleType);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $peopleType = PeopleType::findOrFail($id);
        $peopleType->status = 2;
        $peopleType->save();

        return response()->json($peopleType);
    }

    /**
     * @param $userGroupId
     * @return PeopleType
     */
    private function getPeopleTypeModel($userGroupId, $title){
        $peopleType = PeopleType::where([
            'user_group_id' => $userGroupId,
            'title' => $title
        ])
            ->first();

        return $peopleType ? $peopleType : new PeopleType();
    }
}
