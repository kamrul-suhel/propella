<?php

return array(

    'default' => 'mysql',

    'connections' => array(
        // main
        'mysql' => array(
            'driver'    => 'mysql',
            'host'      => 'localhost',
            'port'      => '3307',
            'database'  => env('DB_DATABASE'),
            'username'  => env('DB_USERNAME'),
            'password'  => env('DB_PASSWORD'),
            'charset'   => 'utf8',
            'collation' => 'utf8_unicode_ci',
            'prefix'    => '',
            'strict'    => false
        ),
    ),
);
