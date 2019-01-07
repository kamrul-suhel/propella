<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGroupsCoordinatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('group_coordinates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->enum('icon_size', ['s','m','l']);
            $table->text('icon_path');
            $table->double('position_x');
            $table->double('position_y');
            $table->bigInteger('group_id')->unsigned()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('group_coordinates');
    }
}
