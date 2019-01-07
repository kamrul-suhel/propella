<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GroupCoordinate extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'group_coordinates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'icon_size',
        'icon_path',
        'position_x',
        'position_y',
        'project_id'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];
}
