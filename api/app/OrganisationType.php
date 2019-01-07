<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OrganisationType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'organisation_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
    ];

    public static function getOrganisationTypeByTitle($title, $object = false){
        $organisationType = Self::where('title', $title)
            ->first();

        if($organisationType){
            // Existing organisation type.
            return $object ? $organisationType : $organisationType->id;
        }else{
            // Create new organisation type.
            $organisationType = new OrganisationType();
            $organisationType->title = $title;

            // Save organisation type
            $organisationType->save();

            return $object ? $organisationType : $organisationType->id;
        }
    }
}
