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


    public function coordinates(){
        return $this->hasMany('App\OrganisationCoordinate', 'organisation_id')
            ->orderBy('created_at', 'DESC');
    }

    public function type(){
        return $this->belongTo();
    }

    public static function getDefaultField(){
        return self::select([
            'organisations.id',
            'organisations.title',
            'organisations.description',
            'organisations.abbreviation',
            'organisation_types.title as organisation_type_title',
            'organisation_types.title as organisation_type_description'
        ])
            ->leftJoin('organisation_types', 'organisation_types.id', '=', 'organisations.type_id');

    }
}
