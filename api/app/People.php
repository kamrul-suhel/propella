<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class People extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'people';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'type_id',
        'organisation_id',
        'abbreviation',
        'character_id',
        'parent_id',
        'status',
        'icon_path',
        'icon_size',
        'abbreviation',
        'positionX',
        'positionY',
        'trajectory',
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
    public static function getDefaultField()
    {
        return self::select([
            'people.id',
            'people.title',
            'people.description',
            'people.status',
            'organisations.title as organisation',
            'organisations.description as organisation_description'
        ])
            ->leftJoin('organisations', 'people.organisation_id', '=', 'organisations.id');
    }

    /**
     * @return mixed
     */
    public function organisation()
    {
        return $this->belongsTo('App\Organisation', 'organisation_id');
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
