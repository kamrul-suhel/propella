<?php

namespace App\Http\Controllers;


use App\Organisation;
use App\OrganisationType;
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
        parent::__construct($request);
    }


    /**
     * Mass update organisation types.
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

        if(!$this->request->isPM){
            return response()->json("You need to be a PM to edit this", 422);
        }

        foreach($this->request->types as $type) {
            // New types will have id 0
            $organizationType = $type['id'] == 0 ? new OrganisationType : OrganisationType::findOrFail($type['id']);

            // Do not update if the user does not have the correct user group
            if(!in_array($organizationType->user_group_id, [$this->request->authUserId, $this->request->projectManagerId]) && ($type['id'] != 0) ) {
                continue;
            }

            // Delete organisation that are marked as deleted
            if(isset($type['deleted']) && $type['deleted'] == 1) {
                // Make sure the organization type is not assigned to any organization
                $organization = Organisation::where('type_id', $type['id'])->first();
                if(!empty($organization)) {
                    $couldNotDelete[] = $type['title'];
                    continue;
                }
                $organizationType->delete();
                continue;
            }

            $organizationType->title         = $type['title'];
            $organizationType->user_group_id = $this->request->authUserId;
            $organizationType->save();
        }

        if(!empty($couldNotDelete)) {
            $typeTitles = implode(",", $couldNotDelete);

            $organizationTypes = OrganisationType::all();

            $response = array(
                'success' => false,
                'message' => "The following types could not be deleted because they are assigned to organisations: $typeTitles",
                'data'    => $organizationTypes
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
        $organisationTypes = OrganisationType::select('id', 'title', 'user_group_id')
            ->whereIn('user_group_id', [$this->request->authUserId, $this->request->projectManagerId])
            ->get();

        return response()->json($organisationTypes);
    }
}
