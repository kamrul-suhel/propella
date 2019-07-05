<?php

namespace App\Http\Controllers;

use App\Competitor;
use Illuminate\Http\Request;

class CompetitorsController extends PropellaBaseController
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
     * @param bool $create
     * @throws \Illuminate\Validation\ValidationException
     */
    private function validateData($create = true){
        $this->validate($this->request, [
            'title' => 'required|string|min:1',
            'description' => 'required|string|min:1'
        ]);

        if($create){
            $this->validate($this->request, [
                'group_id' => 'required|exists:groups,id'
            ]);
        }
    }

    /**
     * @return mixed
     */
    public function create(){
        // validate data.
        $this->validateData();

        $competitors = $this->saveData();

        return response()->json($competitors);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function update($id){

        $this->validateData(false);
        $competitors = $this->saveData($id);

        return response()->json($competitors);

    }

    /**
     * @return mixed
     */
    public function list(){
        $competitors = Competitor::whereIn('status', [1])
            ->get();

        return response()->json($competitors);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function single($id){
        $competitor = Competitor::findOrFail($id);
        return response()->json($competitor);
    }

    /**
     * @param $id
     * @return mixed
     */
    public function delete($id){
        $competitor = Competitor::findOrFail($id);
        $competitor->status = 2;
        $competitor->save();

        return response()->json($competitor);
    }


    /**
     * @param null $id
     * @return Competitor
     */
    private function saveData($id = null){
        $competitors = !empty($id) ? Competitor::findOrFail($id) : new Competitor();

        // set title
        $competitors->title = $this->request->has('title') ? $this->request->title : $competitors->title;

        // set description
        $competitors->description = $this->request->has('description') ? $this->request->description : $competitors->description;

        // set group id
        $competitors->group_id = $this->request->has('group_id') ? $this->request->group_id : $competitors->group_id;

        // set status
        $competitors->status = $this->request->has('status') ? $this->request->status : 1;

        $competitors->save();

        return $competitors;
    }
}
