<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrganisationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('organisations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('description');
            $table->string('abbreviation');
            $table->double('position_x')->index();
            $table->double('position_y')->index();
            $table->string('icon_size');
            $table->text('icon_path');
            $table->tinyInteger('trajectory')->default('1');
            $table->bigInteger('group_id')->unsigned()->index();
            $table->bigInteger('type_id')->unsigned()->index();
            $table->tinyInteger('status');
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
        Schema::dropIfExists('organisations');
    }
}
