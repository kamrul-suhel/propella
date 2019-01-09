<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PeopleCoordinate extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'people_coordinates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'icon_path',
        'icon_size',
        'positionX',
        'positionY',
        'trajectory'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'people_id'
    ];
}
