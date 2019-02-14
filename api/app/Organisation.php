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
            ->whereIn('status', [0,1])
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
            'organisation_types.title as organisation_description'
        ])
            ->leftJoin('organisation_types', 'organisation_types.id', '=', 'organisations.type_id');
    }
}
