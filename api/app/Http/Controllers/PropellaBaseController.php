<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;

class PropellaBaseController extends BaseController
{
    public $request;
    public $perPage;
    public $allData = false;
    public $status;

    //
    public function __construct(Request $request)
    {
        $this->request = $request;
//        $this->middleware('auth');

        // Validate top laval status = active & inactive row.  & all = if you want all data without paginate.
        $this->validate($this->request, [
            'status' => 'integer|min:0|max:1',
            'all' => 'string|starts_with:true'
        ]);

        $this->perPage = $this->request->has('per_page') ? $this->request->per_page : 20;

        // If searching, then you need all the data without paginate
        $this->allData = $this->request->has('all') ? true : false;

        // Set status active or inactive one, you need to search
        $this->status = $this->request->has('status') ? $this->request->status : null;
    }
}
