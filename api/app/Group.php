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

    /**
     * @return mixed
     */
    public function organisations(){
        return $this->hasMany('App\Organisation', 'group_id');
    }

    /**
     * @return mixed
     */
    public function competitors(){
        return $this->hasMany('App\Competitor', 'group_id')
            ->whereIn('status', [0,1]);
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
    public function coordinate(){
        return $this->hasMany('App\GroupCoordinate', 'group_id')
            ->orderBy('created_at', 'DESC')
            ->take(1);
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
            'projects.id as project_id',
            'projects.title as project_title',
            'projects.description as project_description'
        ])
            ->leftJoin('projects', 'groups.project_id', '=', 'projects.id');
    }

    /**
     * @return mixed
     */
    public static function getDefaultFieldWithSingleCoordinate($id){
        return self::select([
            'groups.id',
            'groups.title',
            'groups.description',
            'groups.status',
            'groups.project_id',
            'group_coordinates.position_X',
            'group_coordinates.position_Y',
            'group_coordinates.icon_size',
            'group_coordinates.icon_path',
            'group_coordinates.created_at',
        ])
            ->with(['project', 'organisations.people'])
            ->leftJoin('group_coordinates', 'groups.id', '=', 'group_coordinates.group_id')
            ->orderBy('group_coordinates.created_at', 'DESC')
            ->where('groups.id', $id)
            ->first();
    }
}
