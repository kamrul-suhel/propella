<?php

namespace App\Http\Controllers;


use App\Group;
use App\Organisation;
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
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function create()
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
            'type_id' => 'integer|exists:organisation_types,id',
            'icon_path' => 'file|mimes:jpeg,jpg,png,svg,gif'
        ]);

        $organisation = $this->saveOrganisation();

        return response()->json($organisation);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id)
    {
        $organisation = $this->saveOrganisation(false, $id);

        return response()->json($organisation);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function updateMultiple(){

        $this->validate($this->request, [
            'organisations' => 'required|array',
            'organisations.*.id' => 'required|exists:organisations,id',
        ]);

        $organisations = $this->request->organisations;
        $result = [];

        foreach($organisations as $updateOrganisation){
            if(isset($updateOrganisation['id'])){
                // Create new Group.
                $organisation = Organisation::findOrFail($updateOrganisation['id']);
                isset($updateOrganisation['rel_user_id']) ? $organisation->rel_user_id = $updateOrganisation['rel_user_id'] : '';
                isset($updateOrganisation['title']) ? $organisation->title = $updateOrganisation['title'] : '';
                isset($updateOrganisation['description']) ? $organisation->description = $updateOrganisation['description'] : '';
                isset($updateOrganisation['abbreviation']) ? $organisation->abbreviation = ucwords($updateOrganisation['abbreviation']) : '';
                isset($updateOrganisation['group_id']) ? $organisation->group_id = (int) $updateOrganisation['group_id'] : '';
                isset($updateOrganisation['status']) ? $organisation->status =  $updateOrganisation['status'] : '';
                isset($updateOrganisation['type_id']) ? $organisation->type_id = $updateOrganisation['type_id'] : '';
                isset($updateOrganisation['positionX']) ? $organisation->positionX = $updateOrganisation['positionX'] : '';
                isset($updateOrganisation['positionY']) ? $organisation->positionY = $updateOrganisation['positionY'] : '';
                isset($updateOrganisation['trajectory']) ? $organisation->trajectory =  $updateOrganisation['trajectory'] : '';
                isset($updateOrganisation['icon_size']) ? $organisation->icon_size = $updateOrganisation['icon_size'] : '';

                // First check it has file
                if(isset($updateOrganisation['icon_path']) && is_file($updateOrganisation['icon_path'])){
                    propellaRemoveImage($organisation->icon_path);

                    $newIconPath = propellaUploadImage($updateOrganisation['icon_path'], $this->folderName);
                    $organisation->icon_path = $newIconPath;
                }

                $organisation->save();

                $result[] = $organisations;
            }
        }

        return response()->json($organisations);
    }

    /**
     * @return mixed
     */
    public function list()
    {
        $organisations = Organisation::getDefaultField();

        $organisations = $this->status != null ? $organisations->where('status', $this->status) : $organisations->whereIn('status', [0,1]);
        $organisations = $organisations->where('archive', 0);
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
            ->with(['people'])
            ->findOrFail($id);

        $ids = Organisation::getAllId($organisation->parent_id);
        $coordinates = Organisation::select([
            'id',
            'positionX',
            'positionY',
            'icon_size',
            'icon_path',
            'rel_user_id'
        ])
            ->whereIn('id', $ids)
            ->get();
        $organisation->coordinates = $coordinates;

        return response()->json($organisation);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id)
    {
        $organisation = Organisation::findOrFail($id);
        $organisation->status = 2;
        $organisation->save();

        return response()->json($organisation);
    }

    /**
     * @param bool $create
     * @return Group
     */
    private function saveOrganisation($create = true, $id = 0)
    {
        // Create new Group.
        $organisation = $create ? new Organisation() : Organisation::findOrFail($id);
        $this->request->has('rel_user_id') ? $organisation->rel_user_id = $this->request->rel_user_id : '';
        $this->request->has('title') ? $organisation->title = $this->request->title : '';
        $this->request->has('description') ? $organisation->description = $this->request->description : '';
        $this->request->has('abbreviation') ? $organisation->abbreviation = ucwords($this->request->abbreviation) : '';
        $this->request->has('group_id') ? $organisation->group_id = (int) $this->request->group_id : '';
        $this->request->has('status') ? $organisation->status =  $this->request->status : '';
        $this->request->has('type_id') ? $organisation->type_id = $this->request->type_id : '';
        $this->request->has('positionX') ? $organisation->positionX = $this->request->positionX : '';
        $this->request->has('positionY') ? $organisation->positionY = $this->request->positionY : '';
        $this->request->has('trajectory') ? $organisation->trajectory =  $this->request->trajectory : '';
        $this->request->has('icon_size') ? $organisation->icon_size = $this->request->icon_size : '';

        if($create){
            $organisation->status = 1;
            $organisation->created_by = $this->request->authUserId;

            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                $iconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $organisation->icon_path = $iconPath;
            }
        }else {
            // First check it has file
            if($this->request->has('icon_path') && $this->request->hasFile('icon_path')){
                propellaRemoveImage($organisation->icon_path);

                $newIconPath = propellaUploadImage($this->request->icon_path, $this->folderName);
                $organisation->icon_path = $newIconPath;
            }
        }

        $organisation->save();

        return $organisation;
    }
}
