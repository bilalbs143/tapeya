<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 50);
            $table->string('guard', 30)->default('admin');
            $table->timestamps();

            $table->unique(['slug', 'guard']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
