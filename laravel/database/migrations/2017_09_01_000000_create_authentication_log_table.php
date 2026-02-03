<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuthenticationLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('authentication_log', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->morphs('authenticatable');
            $table->string('oauth_access_token_id', 100)->nullable()->index()->constrained('oauth_access_tokens')->references('id')->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('origin')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('login_at')->nullable();
            $table->timestamp('logout_at')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('authentication_log');
    }
}
