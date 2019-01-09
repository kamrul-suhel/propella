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
    public function coordinates(){
        return $this->hasMany('App\OrganisationCoordinate', 'organisation_id')
            ->orderBy('created_at', 'DESC');
    }

    /**
     * @return mixed
     */
    public function coordinate(){
        return $this->hasMany('App\OrganisationCoordinate', 'organisation_id')
            ->orderBy('created_at', 'DESC')
            ->take(1);
    }

    /**
     * @return mixed
     */
    public function people(){
        return $this->hasMany('App\People', 'organisation_id');
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
            'organisation_types.title as organisation_type',
            'organisation_types.title as organisation_description'
        ])
            ->leftJoin('organisation_types', 'organisation_types.id', '=', 'organisations.type_id');
    }
}
