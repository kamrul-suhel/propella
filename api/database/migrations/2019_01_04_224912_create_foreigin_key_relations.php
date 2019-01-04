<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateForeiginKeyRelations extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Groups table relation with projects.
        Schema::table('groups', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects');
        });

        // Relation  organisations with groups table.
        Schema::table('organisations', function(Blueprint $table){
            $table->foreign('group_id')->references('id')->on('groups');
        });

        Schema::table('peoples', function(Blueprint $table){
            $table->foreign('organisation_id')->references('id')->on('organisations');
            $table->foreign('type_id')->references('id')->on('people_types');
        });

        Schema::table('competitors', function(Blueprint $table){
            $table->foreign('group_id')->references('id')->on('groups');
        });

        Schema::table('people_types', function(Blueprint $table){
           $table->foreign('project_id')->references('id')->on('projects');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

    }
}
