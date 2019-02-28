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
        'group_id',
        'type_id',
        'status',
        'icon_size',
        'icon_path',
        'positionX',
        'positionY',
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
    public function people(){
        return $this->hasMany('App\People', 'organisation_id')
            ->whereIn('status', [1])
            ->where('archive', 0);
    }

    /**
     * @return mixed
     */
    public function type(){
        return $this->belongTo('App\OrganisationType', 'type_id');
    }

    /**
     * @return mixed
     */
    public static function getDefaultField(){
        return self::select([
            'organisations.id',
            'organisations.rel_user_id',
            'organisations.title',
            'organisations.description',
            'organisations.abbreviation',
            'organisations.positionX',
            'organisations.positionY',
            'organisations.trajectory',
            'organisations.icon_size',
            'organisations.created_by',
            'organisations.parent_id',
            'organisations.icon_path',
            'organisations.status',
            'organisation_types.id as type_id',
            'organisation_types.title as organisation_title',
            'organisation_types.title as organisation_description',
            'wp_usermeta.meta_value AS profile_colour'
        ])
            ->leftJoin('organisation_types', 'organisation_types.id', '=', 'organisations.type_id')
            ->leftJoin('wp_usermeta', 'organisations.rel_user_id', '=', DB::raw("wp_usermeta.user_id AND wp_usermeta.meta_key = 'profile_colour'"));
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
