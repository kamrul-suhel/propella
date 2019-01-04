<?php

namespace App\Http\Controllers;

use http\Env\Request;
use Laravel\Lumen\Routing\Controller as BaseController;

class PropellaBaseController extends BaseController
{
    public $request;
    //
    public function __construct(Request $request)
    {
        $this->request = $request;
    }
}
