<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'projects';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'status'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];


    /**
     * @return mixed
     */
    public function groups(){
        return $this->hasMany('App\Group', 'project_id')
            ->whereIn('status', [0,1]);
    }
}
