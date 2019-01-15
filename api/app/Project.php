<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'projects';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'archive'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
//        'archive'
    ];


    /**
     * @return mixed
     */
    public function groups(){
        return $this->hasMany('App\Group', 'project_id')
            ->whereIn('status', [0,1])
            ->where('archive', 0);
    }

    /**
     * @param $parent_id
     * @param $id
     * @return array|string
     */
    public static function getAllId($parent_id, $id){
        $bIds = self::getAllBackwardIdAsString($parent_id);
        $fIds = self::getAllForwardIdAsString($id);
        $bIds = explode(',', $bIds);
        $fIds = explode(',', $fIds);

        $collection = collect([$fIds, $bIds])
            ->collapse()
            ->filter()
//            ->slice(0, 5)
            ->all();

        return $collection;
    }

    /**
     * @param $parent_id
     * @return string
     */
    public static function getAllBackwardIdAsString($parent_id, $count = 1)
    {
        $ids = [];
        if ($parent_id > 0) {
            if($count > 5){
                return;
            }
            $count++;
            $newGroup = self::findOrFail($parent_id);
            $ids[] = self::getAllBackwardIdAsString($newGroup->parent_id, $count);
        }
        $ids[] = $parent_id;
        return implode($ids,',');
    }

    /**
     * @param $id
     * @param int $count
     * @return string|void
     */
    public static function getAllForwardIdAsString($id, $count = 1)
    {
        $ids = [];

        $newProject = self::where('parent_id', $id)
            ->first();

        if($newProject){
            if($count > 5){
                return;
            }
            $count++;
            $ids[] = self::getAllForwardIdAsString($newProject->id, $count);
        }

        $ids[] = $id;
        return implode($ids,',');
    }
}
