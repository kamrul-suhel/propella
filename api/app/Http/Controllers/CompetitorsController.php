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
        }else{
            $this->validate($this->request, [
                'id' => 'required|exists:competitors,id'
            ]);
        }
    }

    public function create(){
        // validate data.
        $this->validateData();

        $competitors = $this->saveData();

        return response()->json($competitors);
    }

    public function update($id){

        $this->validateData(false);
        $competitors = $this->saveData();

        return response()->json($competitors);

    }

    public function list(){
        $competitors = Competitor::whereIn('status', [1,2])
            ->get();

        return response()->json($competitors);
    }

    public function single($id){
        $competitor = Competitor::findOrFail($id);
        return response()->json($competitor);
    }

    public function delete($id){
        $competitor = Competitor::findOrFail($id);

        $competitor->status = 2;

        $competitor->save();

        return response()->json($competitor);
    }


    private function saveData(){
        $competitors = $this->request->has('id') ? Competitor::findOrFail($this->request->id) : new Competitor();

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
