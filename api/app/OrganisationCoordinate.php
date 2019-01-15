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
        'positionX',
        'positionY',
        'icon_size',
        'icon_path',
        'trajectory',
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
