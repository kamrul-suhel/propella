<?php

namespace App\Http\Middleware;

use Closure;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $roles
     * @return mixed
     */
    public function handle($request, Closure $next) {
        $cookie = '';
        // get the login wordpress cookie
        foreach($_COOKIE as $name => $value) {
            if (strpos($name, 'wordpress_logged_in') !== false) {
                $cookie = $name . "=" . $value;
            }
        }

        $url= 'http://propella.hostings.co.uk/wp-admin/admin-ajax.php?action=me';

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_COOKIE, "$cookie; path:/" );

        $res = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ( !$err ) {
            $content = json_decode($res);
            //allow user if we receive success true
            if(!empty($content->success)){
                // set the auth user details in the request so we can access them later
                $request->merge(array(
                    "authUserId"        => $content->data->ID,
                    "authDisplayName"   => $content->data->display_name,
                    "projectManagerId"  => empty($content->data->project_manager) ? $content->data->ID : $content->data->project_manager,
                    "isPM"              => empty($content->data->project_manager)
                ));

                return $next($request);
            }
        }
        return response()->json('Unauthorized', 401);
    }
}
