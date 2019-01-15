<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title');
            $table->text('description');
            $table->string('abbreviation')->nullable();
            $table->enum('icon_size', ['s','m','l']);
            $table->text('icon_path')->nullable();
            $table->double('positionX');
            $table->double('positionY');
            $table->bigInteger('project_id')->unsigned()->index();
            $table->bigInteger('created_by')->unsigned()->index();
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
        Schema::dropIfExists('groups');
    }
}
