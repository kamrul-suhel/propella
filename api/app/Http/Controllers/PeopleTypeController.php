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
        // validate data.
        $this->validateData();

        // Create people type, if set.
        $people = $this->saveData();

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

        $peopleType = PeopleType::findOrFail($id);

        // Update title.
        $this->request->has('title') ? $peopleType->title = $this->request->title: '';

        // update User group_id
        $this->request->has('user_group_id') ? $peopleType->user_group_id = $this->request->user_group_id : '';

        // Update status.
        $this->request->has('status') ? $peopleType->status = $this->request->status : '';

        // Save record.
        $peopleType->save();

        return response()->json($peopleType);

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
                $peopleType->status = isset($user['status']) ? $type['status'] : 1;

                // Save people type.
                $peopleType->save();

                // assign to response.
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
        
        // Check is has any people, if yes then you can not remove this record.
        $people = People::where('type_id', $peopleType->id)
            ->first();
        
        if($people){
            return response()->json(['data' => 'You can not delete this record, it has people.']);
        }

        // Removing record.
        $peopleType->delete();

        return response()->json($peopleType);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true)
    {
        $this->validate($this->request, [
            'types' => 'required|array',
            'types.*.user_group_id' => 'required|integer|min:1',
            'types.*.title' => 'required|string|min:1'
        ]);

        if ($create) {

        }else{
            $this->validate($this->request, [
                'id' => 'required|exists:people_types,id',
            ]);
        }
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
