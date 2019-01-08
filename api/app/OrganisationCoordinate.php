<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OrganisationCoordinate extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'organisation_coordinates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'position_X',
        'position_Y',
        'icon_size',
        'icon_path',
        'trajectory'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];
}
