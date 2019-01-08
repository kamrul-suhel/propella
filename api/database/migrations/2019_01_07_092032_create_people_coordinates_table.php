<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePeopleCoordinatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('people_coordinates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('icon_path');
            $table->enum('icon_size', ['s','m','l']);
            $table->double('position_X');
            $table->double('position_Y');
            $table->tinyInteger('trajectory')->default(1);
            $table->bigInteger('character_id')->unsigned()->index();
            $table->bigInteger('people_id')->unsigned()->index();
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
        Schema::dropIfExists('people_coordinates');
    }
}
