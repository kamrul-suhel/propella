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
            $table->bigInteger('group_id')->unsigned()->index();
            $table->bigInteger('created_by')->unsigned()->index();
            $table->bigInteger('type_id')->unsigned()->index();
            $table->double('positionX')->index();
            $table->double('positionY')->index();
            $table->enum('icon_size', ['s','m','l']);
            $table->text('icon_path')->nullable();
            $table->tinyInteger('trajectory')->default('1');
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
        Schema::dropIfExists('organisations');
    }
}
