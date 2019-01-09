<?php

namespace App\Http\Controllers;

use App\Group;
use App\Organisation;
use App\OrganisationType;
use App\PeopleType;
use App\Project;
use Illuminate\Http\Request;

class OrganisationTypeController extends PropellaBaseController
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

        $organisationType = OrganisationType::findOrFail($id);

        // Update title.
        $this->request->has('title') ? $organisationType->title = $this->request->title: '';

        // update User group_id
        $this->request->has('user_group_id') ? $organisationType->user_group_id = $this->request->user_group_id : '';

        // Update status.
        $this->request->has('status') ? $organisationType->status = $this->request->status : '';

        // Save record.
        $organisationType->save();

        return response()->json($organisationType);

    }

    /**
     * @return array
     */
    private function saveData(){
        $organisationTypes = [];
        if ($this->request->has('types')) {
            foreach ($this->request->types as $type) {

                $organisationType = $this->getOrganisationTypeModel($type['user_group_id'], $type['title']);
                $organisationType->title = $type['title'];
                $organisationType->user_group_id = (int) $type['id'];
                $organisationType->status = isset($type['status']) ? $type['status'] : 1;

                // Save organisation type.
                $organisationType->save();

                // assign to response.
                $organisationTypes[] = $organisationType;
            }
        }
        return $organisationTypes;
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisationTypes = OrganisationType::select([
            'id',
            'title',
            'user_group_id'
        ])->get();

        return response()->json($organisationTypes);
    }

    /**
     * @param $userGroupId
     * @return mixed
     */
    public function getOrganisationTypeByUserGroupId($userGroupId){
        $organisationTypes = OrganisationType::select([
            'id',
            'title'
        ])
            ->where('user_group_id', $userGroupId)
            ->get();

        return response()->json($organisationTypes);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id)
    {
        $organisationType = OrganisationType::findOrFail($id);
        
        return response()->json($organisationType);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $organisationType = OrganisationType::findOrFail($id);

        // Check is has any relation with organisation, if yes then you can not delete this record.
        $organisation = Organisation::where('type_id', $organisationType->id)
            ->first();
        if($organisation){
            return response()->json('You can not delete this record, it has organisation.');
        }

        // Removing record.
        $organisationType->delete();

        return response()->json($organisationType);
    }

    /**
     * @param bool $create
     */
    private function validateData($create = true)
    {
        $this->validate($this->request, [
            'users' => 'required|array',
            'users.*.id' => 'required|integer|min:1',
            'users.*.title' => 'required|string|min:1'
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
    private function getOrganisationTypeModel($userGroupId, $title){
        $peopleType = OrganisationType::where(['user_group_id' => $userGroupId, 'title' => $title])
            ->first();

        return $peopleType ? $peopleType : new OrganisationType();
    }
}
