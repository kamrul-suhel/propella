<?php

namespace App\Http\Controllers;

use DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class UserController extends PropellaBaseController
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        parent::__construct($request);
        $this->middleware('auth');
    }

    /**
     * List all the users. // TODO proper comment
     *
     * @return mixed
     */
    public function list()
    {
        // Get the project manager ID
        $manager = DB::table('wp_usermeta')->select('meta_value AS id')
            ->where('user_id', $this->request->authUserId)
            ->where('meta_key', 'project_manager')
            ->first();

        $users = DB::table('wp_users')
            ->select(
                'wp_users.ID',
                'wp_users.display_name',
                'um2.meta_value AS profile_colour'
            )
            ->leftJoin('wp_usermeta AS um1', 'wp_users.ID', '=', 'um1.user_id')
            ->leftJoin('wp_usermeta AS um2', 'wp_users.ID', '=', 'um2.user_id')
            ->where(function($query) use($manager){
                $pmId = !empty($manager) ? $manager->id : $this->request->authUserId;
                $query->where('um1.meta_key', 'project_manager')
                      ->where('um1.meta_value', $pmId)
                      ->where('um2.meta_key', 'profile_colour');
            })
            ->orWhere('wp_users.ID', $this->request->authUserId)
            ->orderBy('wp_users.display_name')
            ->groupBy('ID')
            ->get();

        return response()->json($users);
    }

    /**
     * Get the auth user details
     *
     * @return mixed
     */
    public function me()
    {
        $user = array(
            'id' => $this->request->authUserId,
            'display_name' => $this->request->authDisplayName,
            'projectManagerId' => $this->request->projectManagerId,
            'isPM' => $this->request->isPM,
        );
        return response()->json($user);
    }
}
