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
        'character_id',
        'parent_id',
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
        return $this->hasMany('App\PeopleCoordinate', 'people_id')
            ->orderBy('created_at', 'DESC');
    }

    /**
     * @return mixed
     */
    public static function getDefaultField(){
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
    public function organisation(){
        return $this->belongsTo('App\Organisation', 'organisation_id');
    }
}
