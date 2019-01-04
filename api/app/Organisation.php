<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Organisation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'organisations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'abbreviation',
        'position_x',
        'position_y',
        'icon_size',
        'icon_path',
        'trajectory',
        'group_id',
        'type_id',
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
