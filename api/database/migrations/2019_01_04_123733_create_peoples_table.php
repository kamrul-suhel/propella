<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePeoplesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('peoples', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('description');
            $table->bigInteger('type_id')->index()->unsigned();
            $table->bigInteger('organisation_id')->index()->unsigned();
            $table->text('icon_path');
            $table->text('icon_preset');
            $table->double('position_x');
            $table->double('position_y');
            $table->tinyInteger('trajectory')->default(1);
            $table->bigInteger('character_id')->unsigned()->index();
            $table->bigInteger('parent_id')->unsigned()->index();
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
        Schema::dropIfExists('people');
    }
}
