<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrganisationCoordinatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organisation_coordinates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->double('position_x')->index();
            $table->double('position_y')->index();
            $table->string('icon_size');
            $table->text('icon_path');
            $table->tinyInteger('trajectory')->default('1');
            $table->bigInteger('organisation_id')->unsigned()->index();
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
        Schema::dropIfExists('organisation_coordinates');
    }
}
