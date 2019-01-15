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
        'status',
        'icon_size',
        'icon_path',
        'positionX',
        'positionY',
        'created_by',
        'parent_id',
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


    /**
     * @return mixed
     */
    public function project()
    {
        return $this->belongsTo('App\Project', 'project_id');
    }

    /**
     * @return mixed
     */
    public function organisations()
    {
        return $this->hasMany('App\Organisation', 'group_id')
            ->whereIn('status', [0, 1])
            ->where('archive', 0);
    }

    /**
     * @return mixed
     */
    public function competitors()
    {
        return $this->hasMany('App\Competitor', 'group_id')
            ->whereIn('status', [0, 1])
            ->where('archive', 0);
    }


    /**
     * @return mixed
     */
    public static function getDefaultField()
    {
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
    public static function getDefaultFieldWithSingleCoordinate($id)
    {
        return self::select([
            'groups.id',
            'groups.title',
            'groups.description',
            'groups.status',
            'groups.project_id',
            'position_X',
            'position_Y',
            'icon_size',
            'icon_path',
            'created_at',
        ])
            ->with(['project', 'organisations.people'])
            ->where('groups.id', $id)
            ->first();
    }

    /**
     * @param $parent_id
     * @return array
     */
    public static function getAllId($parent_id){
        $ids = self::getAllIdAsString($parent_id);
        return explode(',', $ids);
    }

    /**
     * @param $parent_id
     * @return string
     */
    public static function getAllIdAsString($parent_id, $count = 1)
    {
        $ids = [];
        if ($parent_id > 0) {
            if($count > 5){
                return;
            }
            $count++;
            $newGroup = self::findOrFail($parent_id);
            $ids[] = self::getAllIdAsString($newGroup->parent_id, $count);
        }
        $ids[] = $parent_id;
        return implode($ids,',');
    }
}
