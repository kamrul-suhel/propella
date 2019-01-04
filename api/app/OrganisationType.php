<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OrganisationType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'organisation_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];
}
