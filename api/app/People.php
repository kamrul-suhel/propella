<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class People extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'peoples';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'type_id',
        'organisation_id',
        'icon_path',
        'icon_preset',
        'position_x',
        'position_y',
        'trajectory',
        'character_id',
        'parent_id',
        'status'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];
}
