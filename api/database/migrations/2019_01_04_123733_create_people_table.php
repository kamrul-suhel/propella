<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePeopleTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('people', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('description');
            $table->string('abbreviation')->nullable();
            $table->bigInteger('type_id')->unsigned()->index();
            $table->bigInteger('organisation_id')->index()->unsigned();
            $table->bigInteger('created_by')->unsigned()->index();
            $table->text('icon_path')->nullable();
            $table->enum('icon_size', ['s','m','l','f']);
            $table->double('positionX');
            $table->double('positionY');
            $table->tinyInteger('trajectory')->default(1);
            $table->bigInteger('character_id')->unsigned()->index();
            $table->tinyInteger('status');
            $table->bigInteger('parent_id')->index()->unsigned()->default(0);
            $table->tinyinteger('archive')->index()->unsigned()->default(0);
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
