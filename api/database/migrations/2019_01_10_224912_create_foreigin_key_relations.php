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
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });

        // Relation  organisations with groups table.
        Schema::table('organisations', function(Blueprint $table){
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('type_id')->references('id')->on('organisation_types');
        });

        Schema::table('people', function(Blueprint $table){
            $table->foreign('organisation_id')->references('id')->on('organisations')->onDelete('cascade');
            $table->foreign('type_id')->references('id')->on('people_types');
        });

        Schema::table('competitors', function(Blueprint $table){
            $table->foreign('group_id')->references('id')->on('groups');
        });

        Schema::table('people_types', function(Blueprint $table){
           $table->foreign('project_id')->references('id')->on('projects');
        });

        // Group_coordinate
        Schema::table('group_coordinates', function(Blueprint $table){
            $table->foreign('group_id')->references('id')->on('groups');
        });

        // Organisations foreign
        Schema::table('organisation_coordinates', function(Blueprint $table){
            $table->foreign('organisation_id')->references('id')->on('organisations');
        });

        // Peoples foreign
        Schema::table('people_coordinates', function(Blueprint $table){
            $table->foreign('people_id')->references('id')->on('people');
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
