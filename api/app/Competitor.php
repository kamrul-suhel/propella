<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Competitor extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'competitors';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'group_id',
        'status',
        'archive'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'archive'
    ];
}
