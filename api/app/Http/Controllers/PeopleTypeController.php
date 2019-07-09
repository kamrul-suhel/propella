<?php

namespace App\Http\Controllers;

use App\People;
use App\PeopleType;
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
        parent::__construct($request);
    }

    /**
     * Mass update people types.
     *
     * @return mixed
     */
    public function update()
    {
        $this->validate($this->request, [
            'types'           => 'required|array',
            'types.*.id'      => 'required|integer|min:0',
            'types.*.title'   => 'required|string|min:1',
            'types.*.deleted' => 'integer|min:0|max:1'
        ]);

        $couldNotDelete = array();

        if(!$this->request->isPM){
            return response()->json("You need to be a PM to edit this", 422);
        }

        foreach($this->request->types as $type) {
            // New types will have id 0
            $peopleType = $type['id'] == 0 ? new PeopleType : PeopleType::findOrFail($type['id']);

            // Do not update if the user does not have the correct user group
            if( $type['id'] != 0 && !in_array($peopleType->user_group_id, [$this->request->authUserId, $this->request->projectManagerId]) ) {
                continue;
            }

            // Delete organisation that are marked as deleted
            if(isset($type['deleted']) && $type['deleted'] == 1) {
                // Make sure the people type is not assigned to any people
                $people = People::where('type_id', $type['id'])->first();
                if(!empty($people)) {
                    $couldNotDelete[] = $type['title'];
                    continue;
                }
                $peopleType->delete();
                continue;
            }

            $peopleType->title         = $type['title'];
            $peopleType->user_group_id = $this->request->authUserId;
            $peopleType->save();
        }

        if(!empty($couldNotDelete)) {
            $typeTitles = implode(",", $couldNotDelete);

            $peopleTypes = PeopleType::all();

            $response = array(
                'success' => false,
                'message' => "The following types could not be deleted, because they are currently being used: $typeTitles",
                'data'    => $peopleTypes
            );

            return response()->json($response, 422);
        }

        return response()->json(['success' => true]);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisationTypes = PeopleType::select('id', 'title', 'user_group_id')
            ->whereIn('user_group_id', [$this->request->authUserId, $this->request->projectManagerId])
            ->get();

        return response()->json($organisationTypes);
    }

}
