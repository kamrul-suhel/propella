<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PeopleType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'people_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'project_id',
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
