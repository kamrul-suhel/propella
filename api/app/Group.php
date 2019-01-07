<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'groups';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'abbreviation',
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


    /**
     * @return mixed
     */
    public function project(){
        return $this->belongsTo('App\Project', 'project_id');
    }

    public function organisations(){
        return $this->hasMany('App\Organisation', 'group_id');
    }

    /**
     * @return mixed
     */
    public function competitors(){
        return $this->hasMany('App\Competitor', 'group_id');
    }

    /**
     * @return mixed
     */
    public function coordinates(){
        return $this->hasMany('App\GroupCoordinate', 'group_id')
            ->orderBy('created_at', 'DESC');
    }

    /**
     * @return mixed
     */
    public static function getDefaultField(){
        return self::select([
            'groups.id',
            'groups.title',
            'groups.description',
            'groups.status',
            'project.title as project_title',
            'project.description as project_description'
        ])
            ->leftJoin('project', 'groups.project_id', '=', 'project.id');
    }
}
